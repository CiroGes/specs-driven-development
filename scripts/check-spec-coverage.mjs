import { readFileSync, existsSync, readdirSync } from "node:fs";
import { computeCoverage } from "./lib/spec-parsing.mjs";

function parseArgs(argv) {
  const options = { feature: null, featuresDir: "specs/features" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--feature" || arg === "-f") {
      options.feature = argv[index + 1] ?? null;
      index += 1;
    } else if (arg.startsWith("--feature=")) {
      options.feature = arg.slice("--feature=".length);
    } else if (arg === "--features-dir") {
      options.featuresDir = argv[index + 1] ?? options.featuresDir;
      index += 1;
    } else if (arg.startsWith("--features-dir=")) {
      options.featuresDir = arg.slice("--features-dir=".length);
    } else if (!arg.startsWith("-") && !options.feature) {
      options.feature = arg;
    }
  }
  return options;
}

function listFeatureRoots(featuresDir) {
  if (!existsSync(featuresDir)) return [];
  return readdirSync(featuresDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${featuresDir}/${entry.name}`)
    .sort();
}

const { feature, featuresDir } = parseArgs(process.argv.slice(2));
const featureRoots = feature
  ? [`${featuresDir}/${feature}`]
  : listFeatureRoots(featuresDir);

if (featureRoots.length === 0) {
  console.log(`No features yet under ${featuresDir}/ — nothing to check.`);
  process.exit(0);
}

let anyUncovered = false;
let missingFiles = false;

for (const root of featureRoots) {
  const name = root.split("/").pop();
  const specPath = `${root}/feature.spec.md`;
  const tasksPath = `${root}/tasks.md`;
  const acceptancePath = `${root}/acceptance.md`;

  if (!existsSync(specPath) || !existsSync(tasksPath) || !existsSync(acceptancePath)) {
    console.error(`Feature ${name}: missing spec/tasks/acceptance file(s) — skipped.`);
    missingFiles = true;
    continue;
  }

  const { acIds, criteria, orphanTasks, uncovered } = computeCoverage({
    specText: readFileSync(specPath, "utf8"),
    tasksText: readFileSync(tasksPath, "utf8"),
    acceptanceText: readFileSync(acceptancePath, "utf8"),
  });

  console.log(`Feature: ${name}`);

  if (acIds.length === 0) {
    console.log("  (no AC<n> ids declared — nothing to check)");
    console.log("");
    continue;
  }

  for (const c of criteria) {
    const tasksCol = c.tasks.length ? c.tasks.join(",") : "-";
    const verifCol = c.verifications.length ? c.verifications.join(",") : "-";
    const status = c.covered
      ? "OK"
      : `UNCOVERED (${c.tasks.length ? "" : "no task"}${
          !c.tasks.length && !c.verifications.length ? "; " : ""
        }${c.verifications.length ? "" : "no verification"})`;
    console.log(
      `  ${c.id.padEnd(5)} tasks: ${tasksCol.padEnd(16)} verification: ${verifCol.padEnd(20)} ${status}`
    );
  }

  if (orphanTasks.length > 0) {
    console.warn(
      `  Warning: ${orphanTasks.length} orphan task(s) with no AC reference (non-blocking): ${orphanTasks.join(", ")}`
    );
  }

  const coveredCount = criteria.length - uncovered.length;
  console.log(`  Coverage: ${coveredCount}/${criteria.length} criteria covered`);
  console.log("");

  if (uncovered.length > 0) anyUncovered = true;
}

if (missingFiles || anyUncovered) {
  console.error("Spec coverage check failed.");
  process.exit(1);
}

console.log(`Spec coverage check passed for ${featureRoots.length} feature(s).`);
