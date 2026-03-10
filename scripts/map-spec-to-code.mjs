import { readFileSync, existsSync, readdirSync } from "node:fs";

function parseFeatureArg(argv) {
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--feature" || arg === "-f") {
      return argv[index + 1];
    }
    if (arg.startsWith("--feature=")) {
      return arg.slice("--feature=".length);
    }
  }
  return argv[0];
}

function listFeatureSpecPaths() {
  const featuresDir = "specs/features";
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

const feature = parseFeatureArg(process.argv.slice(2));
const specPaths = feature
  ? [`specs/features/${feature}/feature.spec.md`]
  : listFeatureSpecPaths();

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

  for (const path of traceablePaths) {
    if (!existsSync(path)) {
      allMissing.push({ specPath, path });
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
