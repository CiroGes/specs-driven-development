import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), "..");
const MANIFEST_PATH = path.join(REPO_ROOT, "skeleton.manifest.json");

function parseArgs(argv) {
  const options = {
    force: false,
    target: null,
    withExamples: false,
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
  console.log(`Usage: node scripts/install-sdd-skeleton.mjs --target <path> [--with-examples] [--force]

Options:
  --target, -t      Target repository path
  --with-examples   Also install example features and example npm scripts
  --force           Overwrite existing files and package.json keys
  --help, -h        Show this help message`);
}

function loadManifest() {
  return JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
}

function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

function copyEntry(relativePath, targetRoot, force) {
  const sourcePath = path.join(REPO_ROOT, relativePath);
  const targetPath = path.join(targetRoot, relativePath);

  if (!existsSync(sourcePath)) {
    throw new Error(`Manifest path does not exist: ${relativePath}`);
  }

  ensureDir(path.dirname(targetPath));
  cpSync(sourcePath, targetPath, {
    force,
    recursive: true,
    errorOnExist: !force,
  });
}

function copyManifestEntry(entry, targetRoot, force) {
  if (typeof entry === "string") {
    copyEntry(entry, targetRoot, force);
    return;
  }

  const sourcePath = path.join(REPO_ROOT, entry.source);
  const targetPath = path.join(targetRoot, entry.target);

  if (!existsSync(sourcePath)) {
    throw new Error(`Manifest path does not exist: ${entry.source}`);
  }

  ensureDir(path.dirname(targetPath));
  cpSync(sourcePath, targetPath, {
    force,
    recursive: true,
    errorOnExist: !force,
  });
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

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (!options.target) {
      printHelp();
      process.exit(1);
    }

    const targetRoot = path.resolve(process.cwd(), options.target);
    const manifest = loadManifest();
    const warnings = [];

    ensureDir(targetRoot);

    for (const entry of manifest.copy) {
      copyManifestEntry(entry, targetRoot, options.force);
    }

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
        copyManifestEntry(entry, targetRoot, options.force);
      }
      mergePackageJson(
        targetRoot,
        manifest.examples?.packageJson ?? {},
        options.force,
        warnings
      );
    }

    console.log(`Installed SDD skeleton into ${targetRoot}`);
    console.log(
      options.withExamples
        ? "Included: core skeleton and example features"
        : "Included: core skeleton only"
    );
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
