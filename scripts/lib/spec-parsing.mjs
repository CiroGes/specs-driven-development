// Shared parsing helpers for SDD spec tooling (validate-spec-structure,
// check-spec-coverage). Pure functions, no I/O — kept dependency-free to match
// the rest of scripts/.

/**
 * Remove fenced code blocks (```...```) and inline code spans (`...`) from
 * markdown text.
 * @param {string} text
 * @returns {string}
 */
export function stripCode(text) {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "");
}

/**
 * Character ranges [start, end) covered by fenced code blocks or inline code
 * spans, so callers can tell whether a position sits inside code.
 * @param {string} text
 * @returns {Array<[number, number]>}
 */
function codeRanges(text) {
  const ranges = [];
  let m;
  const fence = /```[\s\S]*?```/g;
  while ((m = fence.exec(text)) !== null) {
    ranges.push([m.index, m.index + m[0].length]);
  }
  const inline = /`[^`\n]*`/g;
  while ((m = inline.exec(text)) !== null) {
    const start = m.index;
    if (ranges.some(([s, e]) => start >= s && start < e)) continue; // inside a fence
    ranges.push([start, start + m[0].length]);
  }
  return ranges;
}

/**
 * Find live `[NEEDS CLARIFICATION ...]` markers. Markers are detected first, then
 * those whose `[` sits inside an inline-code span or fenced block are excluded as
 * documentation. (Detecting first preserves marker content — e.g. backticks inside
 * a live marker — and avoids dropping a marker when a stray backtick elsewhere
 * would otherwise mask it.)
 * @param {string} text
 * @returns {string[]} the live marker strings, content intact
 */
export function findClarificationMarkers(text) {
  const ranges = codeRanges(text);
  const markers = [];
  const re = /\[NEEDS CLARIFICATION\b[^\]]*\]/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const start = m.index;
    const inCode = ranges.some(([s, e]) => start >= s && start < e);
    if (!inCode) markers.push(m[0].trim());
  }
  return markers;
}

/**
 * Collect acceptance-criteria ids (AC<n>) declared in the `## Acceptance Criteria`
 * section of a feature spec. An id is a bold `**AC<n>**` token inside that section.
 * H3 subsections are kept; the section ends at the next H2.
 * @param {string} specText
 * @returns {string[]} unique ids in document order
 */
export function parseAcceptanceCriteriaIds(specText) {
  const lines = specText.split("\n");
  let inSection = false;
  const body = [];
  for (const line of lines) {
    if (/^##\s+Acceptance Criteria\s*$/.test(line)) {
      inSection = true;
      continue;
    }
    if (inSection && /^##\s+/.test(line)) break;
    if (inSection) body.push(line);
  }
  const ids = [...body.join("\n").matchAll(/\*\*(AC\d+)\*\*/g)].map((m) => m[1]);
  return [...new Set(ids)];
}

/**
 * Parse checkbox tasks from a tasks.md body. A task spans its checkbox line plus
 * following continuation lines until the next checkbox or heading. Each task's
 * AC references are any AC<n> tokens anywhere in that block.
 * @param {string} tasksText
 * @returns {{label: string, acRefs: string[]}[]}
 */
export function parseTasks(tasksText) {
  const checkbox = /^\s*-\s*\[[ xX]\]\s+/;
  const heading = /^#{1,6}\s/;
  const blocks = [];
  let current = null;
  const flush = () => {
    if (current) blocks.push(current);
    current = null;
  };
  for (const line of tasksText.split("\n")) {
    if (checkbox.test(line)) {
      flush();
      current = line;
    } else if (heading.test(line)) {
      flush();
    } else if (current !== null) {
      current += "\n" + line;
    }
  }
  flush();
  return blocks.map((text) => {
    const firstLine = text.split("\n")[0];
    const tid = (firstLine.match(/\bT\d+\b/) || [])[0];
    const label = tid || firstLine.replace(checkbox, "").trim().slice(0, 40);
    return { label, acRefs: [...new Set(text.match(/\bAC\d+\b/g) || [])] };
  });
}

/**
 * Read the AC->verification map from an acceptance.md table whose first column
 * header is `AC`. Returns a Map of AC id -> array of declared verification kinds
 * (e.g. "auto", "script", "inspect").
 * @param {string} acceptanceText
 * @returns {Map<string, string[]>}
 */
export function parseAcceptanceVerificationMap(acceptanceText) {
  const declared = new Map();
  let headerSeen = false;
  for (const raw of acceptanceText.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("|")) {
      headerSeen = false;
      continue;
    }
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length === 0) continue;
    if (!headerSeen) {
      if (cells[0].toLowerCase() === "ac") headerSeen = true;
      continue;
    }
    if (cells.every((c) => c === "" || /^:?-+:?$/.test(c))) continue;
    const idMatch = cells[0].match(/\bAC\d+\b/);
    const kind = (cells[1] || "").trim();
    if (!idMatch || !kind) continue;
    const list = declared.get(idMatch[0]) || [];
    list.push(kind);
    declared.set(idMatch[0], list);
  }
  return declared;
}

/**
 * Compute spec coverage: each acceptance criterion is covered iff it is referenced
 * by at least one task AND has at least one verification row in acceptance.md.
 * Tasks with no AC reference are reported as orphans (non-blocking).
 * @param {{specText: string, tasksText: string, acceptanceText: string}} input
 */
export function computeCoverage({ specText, tasksText, acceptanceText }) {
  const acIds = parseAcceptanceCriteriaIds(specText);
  const tasks = parseTasks(tasksText);
  const verifMap = parseAcceptanceVerificationMap(acceptanceText);
  const criteria = acIds.map((id) => {
    const coveringTasks = tasks
      .filter((t) => t.acRefs.includes(id))
      .map((t) => t.label);
    const verifications = verifMap.get(id) || [];
    return {
      id,
      tasks: coveringTasks,
      verifications,
      covered: coveringTasks.length > 0 && verifications.length > 0,
    };
  });
  return {
    acIds,
    criteria,
    orphanTasks: tasks.filter((t) => t.acRefs.length === 0).map((t) => t.label),
    uncovered: criteria.filter((c) => !c.covered).map((c) => c.id),
  };
}
