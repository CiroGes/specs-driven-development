#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

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

function parseSemver(input) {
  const normalized = input.startsWith("v") ? input.slice(1) : input;
  const m = normalized.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) {
    throw new Error(`Invalid semver: ${input}`);
  }
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
  };
}

function formatSemver({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`;
}

const pkgPath = path.resolve("package.json");
if (!fs.existsSync(pkgPath)) {
  console.error("package.json not found.");
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const current = parseSemver(pkg.version);

let next;
if (explicitVersion) {
  next = parseSemver(explicitVersion);
} else {
  if (!["major", "minor", "patch"].includes(bumpType)) {
    console.error("--bump must be one of: major, minor, patch");
    process.exit(1);
  }
  next = { ...current };
  if (bumpType === "major") {
    next.major += 1;
    next.minor = 0;
    next.patch = 0;
  }
  if (bumpType === "minor") {
    next.minor += 1;
    next.patch = 0;
  }
  if (bumpType === "patch") {
    next.patch += 1;
  }
}

const newVersion = formatSemver(next);
pkg.version = newVersion;
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

const lockPath = path.resolve("package-lock.json");
if (fs.existsSync(lockPath)) {
  const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  lock.version = newVersion;
  if (lock.packages && lock.packages[""]) {
    lock.packages[""].version = newVersion;
  }
  fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
}

console.log(`Version bumped: ${pkg.version}`);
