import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { readCanonical, buildPlan, writeActions } from "./lib/agent-adapters.mjs";
import { mergeGitignore } from "./lib/gitignore.mjs";

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), "..");
const MANIFEST_PATH = path.join(REPO_ROOT, "skeleton.manifest.json");
const SDD_DIR = path.join(REPO_ROOT, "sdd");
const PROJECTION_MANIFEST_PATH = path.join(SDD_DIR, "agents.manifest.json");

function parseArgs(argv) {
  const options = {
    force: false,
    target: null,
    withExamples: false,
    agents: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--with-examples") {
      options.withExamples = true;
      continue;
    }

    if (arg === "--agents") {
      options.agents = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg.startsWith("--agents=")) {
      options.agents = arg.slice("--agents=".length);
      continue;
    }

    if (arg === "--target" || arg === "-t") {
      options.target = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg.startsWith("--target=")) {
      options.target = arg.slice("--target=".length);
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    if (!options.target) {
      options.target = arg;
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/install-sdd-skeleton.mjs --target <path> [--agents <list>] [--with-examples] [--force]

Options:
  --target, -t      Target repository path
  --agents <list>   Comma-separated agents to set up (claude, codex, opencode).
                    If omitted: prompt on an interactive terminal, else all.
  --with-examples   Also install example features and example npm scripts
  --force           Overwrite existing files and package.json keys
  --help, -h        Show this help message`);
}

function loadProjectionManifest() {
  return JSON.parse(readFileSync(PROJECTION_MANIFEST_PATH, "utf8"));
}

async function resolveAgents(options, allAgents) {
  if (options.agents) {
    return options.agents.split(",").map((a) => a.trim()).filter(Boolean);
  }
  if (process.stdin.isTTY) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const answer = await rl.question(
      `Which agents to set up? Comma-separated from [${allAgents.join(", ")}] (default: all): `
    );
    rl.close();
    const trimmed = answer.trim();
    if (!trimmed) return allAgents;
    return trimmed.split(",").map((a) => a.trim()).filter(Boolean);
  }
  // Non-interactive with no flag: install all agents (backwards-compatible).
  return allAgents;
}

function projectAgents(targetRoot, agents, force, warnings) {
  const projectionManifest = loadProjectionManifest();
  const allAgents = Object.keys(projectionManifest.agents);
  const unknown = agents.filter((a) => !allAgents.includes(a));
  if (unknown.length > 0) {
    throw new Error(
      `Unknown agent(s): ${unknown.join(", ")}. Known: ${allAgents.join(", ")}`
    );
  }
  const canonical = readCanonical(SDD_DIR);
  const plan = buildPlan({ canonical, manifest: projectionManifest, agents });
  const { skipped } = writeActions(plan, targetRoot, { force });
  for (const item of skipped) {
    warnings.push(`Skipped existing adapter file "${item}"`);
  }
}

function mergeTargetGitignore(targetRoot) {
  const gitignorePath = path.join(targetRoot, ".gitignore");
  const existing = existsSync(gitignorePath)
    ? readFileSync(gitignorePath, "utf8")
    : null;
  const merged = mergeGitignore(existing);
  if (merged !== existing) {
    writeFileSync(gitignorePath, merged, "utf8");
  }
}

function loadManifest() {
  return JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
}

function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

// Recursive copy that skips files already present in the target (unless --force),
// recording added/skipped relative paths. Directories are always traversed.
function copyInto(sourcePath, targetPath, force, stats, targetRoot) {
  if (statSync(sourcePath).isDirectory()) {
    ensureDir(targetPath);
    for (const name of readdirSync(sourcePath)) {
      copyInto(
        path.join(sourcePath, name),
        path.join(targetPath, name),
        force,
        stats,
        targetRoot
      );
    }
    return;
  }

  const rel = path.relative(targetRoot, targetPath);
  if (existsSync(targetPath) && !force) {
    stats.skipped.push(rel);
    return;
  }
  ensureDir(path.dirname(targetPath));
  cpSync(sourcePath, targetPath, { force: true });
  stats.added.push(rel);
}

function copyEntry(relativePath, targetRoot, force, stats) {
  const sourcePath = path.join(REPO_ROOT, relativePath);
  if (!existsSync(sourcePath)) {
    throw new Error(`Manifest path does not exist: ${relativePath}`);
  }
  copyInto(sourcePath, path.join(targetRoot, relativePath), force, stats, targetRoot);
}

function copyManifestEntry(entry, targetRoot, force, stats) {
  if (typeof entry === "string") {
    copyEntry(entry, targetRoot, force, stats);
    return;
  }

  const sourcePath = path.join(REPO_ROOT, entry.source);
  if (!existsSync(sourcePath)) {
    throw new Error(`Manifest path does not exist: ${entry.source}`);
  }
  copyInto(sourcePath, path.join(targetRoot, entry.target), force, stats, targetRoot);
}

function generateEntry(sourceRelativePath, targetRelativePath, targetRoot, force) {
  const sourcePath = path.join(REPO_ROOT, sourceRelativePath);
  const targetPath = path.join(targetRoot, targetRelativePath);

  if (existsSync(targetPath) && !force) {
    return false;
  }

  ensureDir(path.dirname(targetPath));
  cpSync(sourcePath, targetPath, { force: true });
  return true;
}

function mergeRecord(targetRecord, additions, force, label, warnings) {
  for (const [key, value] of Object.entries(additions)) {
    if (!(key in targetRecord) || force) {
      targetRecord[key] = value;
      continue;
    }

    if (targetRecord[key] !== value) {
      warnings.push(`Skipped existing ${label} "${key}"`);
    }
  }
}

function mergePackageJson(targetRoot, manifestSection, force, warnings) {
  const packageJsonPath = path.join(targetRoot, "package.json");
  const packageJson = existsSync(packageJsonPath)
    ? JSON.parse(readFileSync(packageJsonPath, "utf8"))
    : {};

  if (!packageJson.name) {
    packageJson.name = path.basename(targetRoot);
  }

  if (!packageJson.version) {
    packageJson.version = "0.1.0";
  }

  if (manifestSection.type && (!packageJson.type || force)) {
    packageJson.type = manifestSection.type;
  }

  packageJson.scripts ??= {};
  packageJson.devDependencies ??= {};

  mergeRecord(
    packageJson.scripts,
    manifestSection.scripts ?? {},
    force,
    "script",
    warnings
  );
  mergeRecord(
    packageJson.devDependencies,
    manifestSection.devDependencies ?? {},
    force,
    "devDependency",
    warnings
  );

  writeFileSync(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
    "utf8"
  );
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (!options.target) {
      printHelp();
      process.exit(1);
    }

    const targetRoot = path.resolve(process.cwd(), options.target);
    const manifest = loadManifest();
    const allAgents = Object.keys(loadProjectionManifest().agents);
    const agents = await resolveAgents(options, allAgents);

    // Validate agents BEFORE writing anything to the target.
    const unknownAgents = agents.filter((a) => !allAgents.includes(a));
    if (unknownAgents.length > 0) {
      throw new Error(
        `Unknown agent(s): ${unknownAgents.join(", ")}. Known: ${allAgents.join(", ")}`
      );
    }

    const warnings = [];
    const stats = { added: [], skipped: [] };

    ensureDir(targetRoot);

    // Agent-agnostic assets (always installed; existing files skipped unless --force).
    for (const entry of manifest.copy) {
      copyManifestEntry(entry, targetRoot, options.force, stats);
    }

    // Per-agent adapters (only the selected agents, projected from sdd/).
    projectAgents(targetRoot, agents, options.force, warnings);

    // Consumer .gitignore (created if absent; missing lines appended otherwise).
    mergeTargetGitignore(targetRoot);

    for (const entry of manifest.generate ?? []) {
      const generated = generateEntry(
        entry.source,
        entry.target,
        targetRoot,
        options.force
      );
      if (!generated) {
        warnings.push(`Skipped existing generated file "${entry.target}"`);
      }
    }

    mergePackageJson(
      targetRoot,
      manifest.packageJson ?? {},
      options.force,
      warnings
    );

    if (options.withExamples) {
      for (const entry of manifest.examples?.copy ?? []) {
        copyManifestEntry(entry, targetRoot, options.force, stats);
      }
      mergePackageJson(
        targetRoot,
        manifest.examples?.packageJson ?? {},
        options.force,
        warnings
      );
    }

    console.log(`Installed SDD skeleton into ${targetRoot}`);
    console.log(`Agents set up: ${agents.join(", ")}`);
    console.log(
      options.withExamples
        ? "Included: core skeleton and example features"
        : "Included: core skeleton only"
    );
    console.log(
      `Assets: ${stats.added.length} added, ${stats.skipped.length} skipped (already present).`
    );
    if (stats.skipped.length > 0 && !options.force) {
      console.log("Pass --force to overwrite the skipped files.");
    }
    console.log("Next steps:");
    console.log("- Run npm install");
    console.log("- Review docs/product-prd.md");
    console.log("- Start your first feature under specs/features/<feature>/");

    if (warnings.length > 0) {
      console.warn("Warnings:");
      for (const warning of warnings) {
        console.warn(`- ${warning}`);
      }
    }
  } catch (error) {
    console.error(
      `Failed to install SDD skeleton: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}

main();
