// Pure helpers for the release-manager scripts (semver + changelog). No I/O, so
// they are unit-testable; bump-version.mjs / generate-changelog.mjs are thin
// wrappers around these.

/**
 * Parse a semver string, tolerating a leading `v` and an optional
 * `-prerelease` / `+build` suffix. Throws a clear error on empty/invalid input.
 * @param {string} input
 * @returns {{major:number,minor:number,patch:number,suffix:string,normalized:string}}
 */
export function parseSemver(input) {
  if (input == null || String(input).trim() === "") {
    throw new Error('No "version" found (package.json is missing a version field?)');
  }
  const raw = String(input).trim();
  const normalized = raw.startsWith("v") ? raw.slice(1) : raw;
  const match = normalized.match(/^(\d+)\.(\d+)\.(\d+)([-+].*)?$/);
  if (!match) {
    throw new Error(`Invalid semver: ${input}`);
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    suffix: match[4] || "",
    normalized,
  };
}

/**
 * Bump the core x.y.z of a version (dropping any pre-release/build suffix).
 * @param {string} version current version (may carry a suffix)
 * @param {"major"|"minor"|"patch"} type
 * @returns {string} the bumped `x.y.z`
 */
export function bumpSemver(version, type) {
  const { major, minor, patch } = parseSemver(version);
  if (type === "major") return `${major + 1}.0.0`;
  if (type === "minor") return `${major}.${minor + 1}.0`;
  if (type === "patch") return `${major}.${minor}.${patch + 1}`;
  throw new Error("--bump must be one of: major, minor, patch");
}

/**
 * Parse a `<hash>\t<subject>` git log line. Splits on the FIRST tab only, so a
 * subject containing a tab is preserved. Recognizes conventional-commit prefixes.
 * @param {string} line
 */
export function parseCommitLine(line) {
  const idx = line.indexOf("\t");
  const hash = idx === -1 ? "" : line.slice(0, idx);
  const subject = idx === -1 ? line : line.slice(idx + 1);
  const match = subject.match(/^([a-z]+)(\([^)]*\))?(!)?:\s(.+)$/i);
  return {
    hash,
    subject,
    type: match ? match[1].toLowerCase() : null,
    breaking: match ? Boolean(match[3]) : false,
    description: match ? match[4] : subject,
  };
}

export const CHANGELOG_BUCKETS = [
  "breaking",
  "feat",
  "fix",
  "perf",
  "refactor",
  "docs",
  "test",
  "build",
  "ci",
  "chore",
  "revert",
  "other",
];

const BUCKET_TITLES = {
  breaking: "Breaking Changes",
  feat: "Features",
  fix: "Fixes",
  perf: "Performance",
  refactor: "Refactors",
  docs: "Documentation",
  test: "Tests",
  build: "Build",
  ci: "CI",
  chore: "Chores",
  revert: "Reverts",
  other: "Other",
};

/**
 * Build a CHANGELOG section body from `<hash>\t<subject>` lines. Breaking commits
 * (conventional `!`) are surfaced in their own section in addition to their type.
 * @param {string} tag
 * @param {string} date  YYYY-MM-DD
 * @param {string[]} commitLines
 * @returns {string}
 */
export function buildChangelogBody(tag, date, commitLines) {
  const sections = Object.fromEntries(CHANGELOG_BUCKETS.map((k) => [k, []]));
  for (const line of commitLines) {
    const c = parseCommitLine(line);
    const bucket = c.type && sections[c.type] ? c.type : "other";
    const entry = `- ${c.description}${c.hash ? ` (${c.hash})` : ""}`;
    if (c.breaking) sections.breaking.push(entry);
    sections[bucket].push(entry);
  }
  let body = `## ${tag} - ${date}\n\n`;
  for (const key of CHANGELOG_BUCKETS) {
    if (sections[key].length === 0) continue;
    body += `### ${BUCKET_TITLES[key]}\n${sections[key].join("\n")}\n\n`;
  }
  return body;
}
