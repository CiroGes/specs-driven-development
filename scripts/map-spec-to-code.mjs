import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const options = {
    feature: null,
    featuresDir: "specs/features",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--feature" || arg === "-f") {
      options.feature = argv[index + 1] ?? null;
      index += 1;
      continue;
    }
    if (arg.startsWith("--feature=")) {
      options.feature = arg.slice("--feature=".length);
      continue;
    }
    if (arg === "--features-dir") {
      options.featuresDir = argv[index + 1] ?? options.featuresDir;
      index += 1;
      continue;
    }
    if (arg.startsWith("--features-dir=")) {
      options.featuresDir = arg.slice("--features-dir=".length);
      continue;
    }
    if (!arg.startsWith("-") && !options.feature) {
      options.feature = arg;
    }
  }

  return options;
}

function listFeatureSpecPaths(featuresDir) {
  if (!existsSync(featuresDir)) {
    return [];
  }

  return readdirSync(featuresDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${featuresDir}/${entry.name}/feature.spec.md`)
    .filter((path) => existsSync(path));
}

function isConcreteRepoPath(value) {
  return (
    (value.startsWith("src/") ||
      value.startsWith("tests/") ||
      value.startsWith("specs/")) &&
    !value.includes("<") &&
    !value.includes(">")
  );
}

function deriveProjectRoot(featuresDir) {
  const normalizedPath = path.posix.normalize(
    featuresDir.split(path.sep).join(path.posix.sep)
  );
  const suffix = "/specs/features";

  if (normalizedPath === "specs/features") {
    return ".";
  }
  if (normalizedPath.endsWith(suffix)) {
    const projectRoot = normalizedPath.slice(0, -suffix.length);
    return projectRoot.length > 0 ? projectRoot : ".";
  }

  return ".";
}

const { feature, featuresDir } = parseArgs(process.argv.slice(2));
const projectRoot = deriveProjectRoot(featuresDir);
const specPaths = feature
  ? [`${featuresDir}/${feature}/feature.spec.md`]
  : listFeatureSpecPaths(featuresDir);

if (feature && !existsSync(specPaths[0])) {
  console.error(`Feature spec not found: ${specPaths[0]}`);
  process.exit(1);
}

if (specPaths.length === 0) {
  console.error(
    "No feature specs found under specs/features/*/feature.spec.md"
  );
  process.exit(1);
}

const allMissing = [];
const specsWithNoTraceablePaths = [];
let totalTraceablePaths = 0;

for (const specPath of specPaths) {
  const content = readFileSync(specPath, "utf8");
  const pathMatches = [...content.matchAll(/`([^`\n]+)`/g)].map((match) =>
    match[1].trim()
  );
  const traceablePaths = pathMatches.filter(isConcreteRepoPath);

  totalTraceablePaths += traceablePaths.length;

  if (traceablePaths.length === 0) {
    specsWithNoTraceablePaths.push(specPath);
  }

  for (const traceablePath of traceablePaths) {
    const absolutePath = path.join(projectRoot, traceablePath);
    if (!existsSync(absolutePath)) {
      allMissing.push({ specPath, path: traceablePath });
    }
  }
}

if (allMissing.length > 0) {
  console.error("Broken traceability links:");
  for (const item of allMissing) {
    console.error(`- ${item.path} (referenced in ${item.specPath})`);
  }
  process.exit(1);
}

if (specsWithNoTraceablePaths.length > 0) {
  console.warn("Warning: no traceable paths found in:");
  for (const specPath of specsWithNoTraceablePaths) {
    console.warn(`- ${specPath}`);
  }
}

console.log(
  `Traceability mapping passed for ${totalTraceablePaths} paths across ${specPaths.length} feature spec(s).`
);
