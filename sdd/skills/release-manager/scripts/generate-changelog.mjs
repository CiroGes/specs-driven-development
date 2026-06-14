#!/usr/bin/env node

import fs from "node:fs";
import { execSync } from "node:child_process";
import { buildChangelogBody } from "./release-lib.mjs";

const args = process.argv.slice(2);
const versionFlag = args.indexOf("--version");
const version = versionFlag >= 0 ? args[versionFlag + 1] : undefined;

if (!version) {
  console.error("Usage: generate-changelog.mjs --version vX.Y.Z");
  process.exit(1);
}

const tag = version.startsWith("v") ? version : `v${version}`;
const today = new Date().toISOString().slice(0, 10);
const changelogPath = "CHANGELOG.md";

function sh(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

// Range base = nearest tag reachable from HEAD (not the newest tag globally, which
// can pick up commits from another branch). Empty when there is no prior tag.
let lastTag = "";
try {
  lastTag = sh("git describe --tags --abbrev=0");
} catch {
  lastTag = "";
}
const range = lastTag ? `${lastTag}..HEAD` : "HEAD";

let raw;
try {
  raw = sh(`git log --pretty=format:%h%x09%s ${range}`);
} catch (error) {
  console.error(`Could not read git log (is this a git repo with commits?): ${error.message}`);
  process.exit(1);
}
const lines = raw.split("\n").filter(Boolean);

if (lines.length === 0) {
  console.error("No commits found for changelog range.");
  process.exit(1);
}

const body = buildChangelogBody(tag, today, lines);

let existing = "";
if (fs.existsSync(changelogPath)) {
  existing = fs.readFileSync(changelogPath, "utf8");
  if (existing.includes(`## ${tag} - `)) {
    console.error(`Changelog already contains section for ${tag}`);
    process.exit(1);
  }
}

if (!existing) {
  existing = "# Changelog\n\n";
}

const header = "# Changelog\n\n";
const withoutHeader = existing.startsWith(header)
  ? existing.slice(header.length)
  : existing;

const nextContent = `${header}${body}${withoutHeader}`;
fs.writeFileSync(changelogPath, nextContent);
console.log(`CHANGELOG.md updated for ${tag}`);
