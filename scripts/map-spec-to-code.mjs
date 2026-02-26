import { readFileSync, existsSync } from "node:fs";

const specPath = "specs/features/hello-world/feature.spec.md";
const content = readFileSync(specPath, "utf8");

const pathMatches = [...content.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
const traceablePaths = pathMatches.filter((value) => value.startsWith("src/") || value.startsWith("tests/") || value.startsWith("specs/"));

const missing = traceablePaths.filter((path) => !existsSync(path));

if (missing.length > 0) {
  console.error("Broken traceability links:");
  for (const path of missing) {
    console.error(`- ${path}`);
  }
  process.exit(1);
}

console.log(`Traceability mapping passed for ${traceablePaths.length} paths.`);
