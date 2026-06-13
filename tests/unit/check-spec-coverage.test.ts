import { describe, it, expect } from "vitest";
import {
  parseAcceptanceCriteriaIds,
  parseTasks,
  parseAcceptanceVerificationMap,
  computeCoverage,
} from "../../scripts/lib/spec-parsing.mjs";

const spec = `# Feature: demo
## Acceptance Criteria
### A. group
- **AC1** — The system SHALL do x.
- **AC2** — WHEN y, the system SHALL z.
- **AC3** — The system SHALL w.
## Clarifications (resolved)
1. **AC2 — note:** resolved (this prose AC mention must not count).
## Traceability
- x
`;

const tasks = `# Tasks: demo
## Ordered tasks
- [ ] **T1.** Confirm spec.
- [ ] **T2.** Implement x and
      its edge handling. (AC1, AC2)
- [x] **T3.** Implement w. (AC3)
## Risks
- prose mentioning AC1 here must not become a task ref
`;

const acceptance = `# Acceptance: demo
| AC | Verification | Test |
|----|--------------|------|
| AC1 | auto | t_x |
| AC2 | inspect | reviewed |
`;

describe("parseAcceptanceCriteriaIds", () => {
  it("reads ids from the Acceptance Criteria section only", () => {
    expect(parseAcceptanceCriteriaIds(spec)).toEqual(["AC1", "AC2", "AC3"]);
  });
});

describe("parseTasks", () => {
  it("extracts AC refs across continuation lines and marks orphans", () => {
    const parsed = parseTasks(tasks);
    expect(parsed).toHaveLength(3);
    expect(parsed[0]).toMatchObject({ label: "T1", acRefs: [] });
    expect(parsed[1].acRefs).toEqual(["AC1", "AC2"]);
    expect(parsed[2].acRefs).toEqual(["AC3"]);
  });
});

describe("parseAcceptanceVerificationMap", () => {
  it("maps AC ids to verification kinds, skipping header/separator", () => {
    const map = parseAcceptanceVerificationMap(acceptance);
    expect(map.get("AC1")).toEqual(["auto"]);
    expect(map.get("AC2")).toEqual(["inspect"]);
    expect(map.has("AC3")).toBe(false);
  });
});

describe("computeCoverage", () => {
  it("reports covered, uncovered (no verification), and orphan tasks", () => {
    const result = computeCoverage({
      specText: spec,
      tasksText: tasks,
      acceptanceText: acceptance,
    });
    // AC1, AC2 have task + verification -> covered. AC3 has task but no verification.
    expect(result.uncovered).toEqual(["AC3"]);
    expect(result.orphanTasks).toEqual(["T1"]);
    const ac1 = result.criteria.find((c) => c.id === "AC1");
    expect(ac1?.covered).toBe(true);
    expect(ac1?.tasks).toEqual(["T2"]);
    expect(ac1?.verifications).toEqual(["auto"]);
  });

  it("flags a criterion with no referencing task as uncovered", () => {
    const lonelySpec = `## Acceptance Criteria\n- **AC1** — The system SHALL x.\n## Traceability\n`;
    const noTask = `# Tasks\n- [ ] do something unrelated\n`;
    const verif = `| AC | Verification |\n|----|----|\n| AC1 | auto |\n`;
    const result = computeCoverage({
      specText: lonelySpec,
      tasksText: noTask,
      acceptanceText: verif,
    });
    expect(result.uncovered).toEqual(["AC1"]);
  });

  it("treats a spec with no AC ids as nothing-to-check (no uncovered)", () => {
    const result = computeCoverage({
      specText: "## Acceptance Criteria\n- free-form criterion\n## Traceability\n",
      tasksText: "# Tasks\n- [ ] do x\n",
      acceptanceText: "no table here",
    });
    expect(result.acIds).toEqual([]);
    expect(result.uncovered).toEqual([]);
  });
});
