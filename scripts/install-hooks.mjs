#!/usr/bin/env node
// Activate the versioned hooks under .githooks/ via core.hooksPath (no Husky).
// No-op outside a git repo (e.g. tarball install), so it never breaks `npm install`.

import { execFileSync } from "node:child_process";

try {
  execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { stdio: "ignore" });
} catch {
  process.exit(0); // not a git work tree — nothing to wire
}

try {
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "ignore" });
  console.log("Git hooks enabled (core.hooksPath=.githooks).");
} catch (error) {
  console.warn(
    `Could not enable git hooks: ${error instanceof Error ? error.message : String(error)}`
  );
}
