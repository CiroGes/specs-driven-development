import { readFileSync, existsSync, readdirSync } from "node:fs";

const REQUIRED_SECTION_TITLES = [
  "Context",
  "Problem",
  "Goals",
  "Non-Goals",
  "Scenarios",
  "Acceptance Criteria",
  "Traceability",
];

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

function listFeatureRoots() {
  const featuresDir = "specs/features";
  if (!existsSync(featuresDir)) {
    return [];
  }

  return readdirSync(featuresDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${featuresDir}/${entry.name}`);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasRequiredSection(specContent, title) {
  // Match exact H2 headings line-by-line to avoid accidental multiline matches.
  const sectionPattern = new RegExp(`^##\\s+${escapeRegex(title)}\\s*$`, "m");
  return sectionPattern.test(specContent);
}

const feature = parseFeatureArg(process.argv.slice(2));
const featureRoots = feature
  ? [`specs/features/${feature}`]
  : listFeatureRoots();

if (feature && !existsSync(featureRoots[0])) {
  console.error(`Feature folder not found: ${featureRoots[0]}`);
  process.exit(1);
}

if (featureRoots.length === 0) {
  console.error("No feature folders found under specs/features/*");
  process.exit(1);
}

const missingFiles = [];
const missingSections = [];

for (const featureRoot of featureRoots) {
  const requiredFiles = [
    `${featureRoot}/feature.spec.md`,
    `${featureRoot}/tasks.md`,
    `${featureRoot}/acceptance.md`,
  ];

  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      missingFiles.push(file);
    }
  }

  const specPath = `${featureRoot}/feature.spec.md`;
  if (!existsSync(specPath)) {
    continue;
  }

  const specContent = readFileSync(specPath, "utf8");
  for (const sectionTitle of REQUIRED_SECTION_TITLES) {
    if (!hasRequiredSection(specContent, sectionTitle)) {
      missingSections.push({ specPath, sectionTitle });
    }
  }
}

if (missingFiles.length > 0) {
  console.error("Missing required spec files:");
  for (const file of missingFiles) {
    console.error(`- ${file}`);
  }
}

if (missingSections.length > 0) {
  console.error("Missing required sections in feature.spec.md:");
  for (const item of missingSections) {
    console.error(`- ## ${item.sectionTitle} (in ${item.specPath})`);
  }
}

if (missingFiles.length > 0 || missingSections.length > 0) {
  process.exit(1);
}

console.log(
  `Spec structure validation passed for ${featureRoots.length} feature(s).`
);
