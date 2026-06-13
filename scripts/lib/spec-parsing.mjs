// Shared parsing helpers for SDD spec tooling (validate-spec-structure,
// check-spec-coverage). Pure functions, no I/O — kept dependency-free to match
// the rest of scripts/.

/**
 * Remove fenced code blocks (```...```) and inline code spans (`...`) from
 * markdown text. Used so that documentation *mentions* of a token are not
 * mistaken for live content.
 * @param {string} text
 * @returns {string}
 */
export function stripCode(text) {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "");
}

/**
 * Find live `[NEEDS CLARIFICATION ...]` markers in markdown prose. Markers inside
 * inline code or fenced code blocks are treated as documentation and ignored.
 * @param {string} text
 * @returns {string[]} the full marker strings found in prose
 */
export function findClarificationMarkers(text) {
  const prose = stripCode(text);
  const matches = prose.match(/\[NEEDS CLARIFICATION\b[^\]]*\]/g);
  return matches ? matches.map((m) => m.trim()) : [];
}
