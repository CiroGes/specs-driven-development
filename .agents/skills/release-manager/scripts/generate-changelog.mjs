#!/usr/bin/env node

import fs from "node:fs";
import { execSync } from "node:child_process";

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

const allTags = sh("git tag --sort=-creatordate");
const lastTag = allTags.split("\n").filter(Boolean)[0] || "";
const range = lastTag ? `${lastTag}..HEAD` : "HEAD";

const raw = sh(`git log --pretty=format:%h%x09%s ${range}`);
const lines = raw.split("\n").filter(Boolean);

if (lines.length === 0) {
  console.error("No commits found for changelog range.");
  process.exit(1);
}

const sections = {
  feat: [],
  fix: [],
  perf: [],
  refactor: [],
  docs: [],
  test: [],
  chore: [],
  other: [],
};

for (const line of lines) {
  const [hash, subject] = line.split("\t");
  const m = subject.match(/^([a-z]+)(\([^)]*\))?(!)?:\s(.+)$/i);
  const key = m ? m[1].toLowerCase() : "other";
  const text = m ? m[4] : subject;
  const bucket = sections[key] ? key : "other";
  sections[bucket].push(`- ${text} (${hash})`);
}

let body = `## ${tag} - ${today}\n\n`;
const order = ["feat", "fix", "perf", "refactor", "docs", "test", "chore", "other"];
const titles = {
  feat: "Features",
  fix: "Fixes",
  perf: "Performance",
  refactor: "Refactors",
  docs: "Documentation",
  test: "Tests",
  chore: "Chores",
  other: "Other",
};

for (const key of order) {
  if (sections[key].length === 0) continue;
  body += `### ${titles[key]}\n`;
  body += `${sections[key].join("\n")}\n\n`;
}

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
