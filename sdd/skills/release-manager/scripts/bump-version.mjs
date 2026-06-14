#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseSemver, bumpSemver } from "./release-lib.mjs";

const args = process.argv.slice(2);

function arg(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

const explicitVersion = arg("--version");
const bumpType = arg("--bump");

if (!explicitVersion && !bumpType) {
  console.error("Usage: bump-version.mjs --version vX.Y.Z | --bump major|minor|patch");
  process.exit(1);
}

if (explicitVersion && bumpType) {
  console.error("Provide either --version or --bump, not both.");
  process.exit(1);
}

const pkgPath = path.resolve("package.json");
if (!fs.existsSync(pkgPath)) {
  console.error("package.json not found.");
  process.exit(1);
}

let pkg;
try {
  pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
} catch (error) {
  console.error(`Could not parse package.json: ${error.message}`);
  process.exit(1);
}

let newVersion;
try {
  if (explicitVersion) {
    // Preserve an explicit pre-release/build suffix (e.g. v1.2.3-rc.1).
    newVersion = parseSemver(explicitVersion).normalized;
  } else {
    // Bump the core x.y.z of the current version (tolerates a suffix on it).
    newVersion = bumpSemver(pkg.version, bumpType);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

pkg.version = newVersion;
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

const lockPath = path.resolve("package-lock.json");
if (fs.existsSync(lockPath)) {
  try {
    const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
    lock.version = newVersion;
    if (lock.packages && lock.packages[""]) {
      lock.packages[""].version = newVersion;
    }
    fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  } catch (error) {
    console.warn(`Could not update package-lock.json: ${error.message}`);
  }
}

console.log(`Version bumped: ${pkg.version}`);
