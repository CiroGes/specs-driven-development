import { readFileSync, existsSync } from "node:fs";

const featureRoot = "specs/features/hello-world";
const requiredFiles = [
  `${featureRoot}/feature.spec.md`,
  `${featureRoot}/tasks.md`,
  `${featureRoot}/acceptance.md`
];

const requiredSections = [
  "## Context",
  "## Problem",
  "## Goals",
  "## Non-Goals",
  "## Scenarios",
  "## Acceptance Criteria",
  "## Traceability"
];

const missingFiles = requiredFiles.filter((file) => !existsSync(file));
if (missingFiles.length > 0) {
  console.error("Missing required spec files:");
  for (const file of missingFiles) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

const specContent = readFileSync(`${featureRoot}/feature.spec.md`, "utf8");
const missingSections = requiredSections.filter((section) => !specContent.includes(section));
if (missingSections.length > 0) {
  console.error("Missing required sections in feature.spec.md:");
  for (const section of missingSections) {
    console.error(`- ${section}`);
  }
  process.exit(1);
}

console.log("Spec structure validation passed.");
