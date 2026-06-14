// Pure helper for producing/merging a consumer .gitignore in an installed target.
// Append-only: never modifies or removes a user's existing lines; idempotent.

// Consumer ignore set. Intentionally does NOT include the generated-adapter trees
// (.claude/.agents/.opencode/CLAUDE.md): installed targets commit their adapters.
export const CONSUMER_GITIGNORE = [
  "node_modules/",
  "dist/",
  "coverage/",
  "*.log",
  ".DS_Store",
];

/**
 * Merge the consumer ignore entries into an existing .gitignore body.
 * @param {string|null} existing  current file contents, or null if absent
 * @param {string[]} entries      ignore lines to ensure are present
 * @returns {string} the new file contents (=== existing when nothing to add)
 */
export function mergeGitignore(existing, entries = CONSUMER_GITIGNORE) {
  if (existing == null || existing.trim() === "") {
    return entries.join("\n") + "\n";
  }
  const present = new Set(existing.split("\n").map((line) => line.trim()));
  const missing = entries.filter((entry) => !present.has(entry));
  if (missing.length === 0) return existing;
  const sep = existing.endsWith("\n") ? "" : "\n";
  return `${existing}${sep}\n# SDD skeleton\n${missing.join("\n")}\n`;
}
