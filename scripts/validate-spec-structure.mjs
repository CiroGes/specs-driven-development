import { readFileSync, existsSync, readdirSync } from "node:fs";
import { findClarificationMarkers } from "./lib/spec-parsing.mjs";

const REQUIRED_SECTION_TITLES = [
  "Context",
  "Problem",
  "Goals",
  "Non-Goals",
  "Scenarios",
  "Acceptance Criteria",
  "Traceability",
];

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

function listFeatureRoots(featuresDir) {
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

const { feature, featuresDir } = parseArgs(process.argv.slice(2));
const featureRoots = feature
  ? [`${featuresDir}/${feature}`]
  : listFeatureRoots(featuresDir);

if (feature && !existsSync(featureRoots[0])) {
  console.error(`Feature folder not found: ${featureRoots[0]}`);
  process.exit(1);
}

if (featureRoots.length === 0) {
  console.log(`No features yet under ${featuresDir}/ — nothing to validate.`);
  process.exit(0);
}

const missingFiles = [];
const missingSections = [];
const clarificationWarnings = [];

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

  for (const marker of findClarificationMarkers(specContent)) {
    clarificationWarnings.push({ specPath, marker });
  }
}

if (clarificationWarnings.length > 0) {
  console.warn("Warning: unresolved [NEEDS CLARIFICATION] markers (non-blocking):");
  for (const item of clarificationWarnings) {
    console.warn(`- ${item.marker} (in ${item.specPath})`);
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
