import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const VALIDATE = path.resolve("scripts/validate-spec-structure.mjs");
const MAP = path.resolve("scripts/map-spec-to-code.mjs");

function run(
  script: string,
  dir: string,
  feature: string,
  extra: string[] = []
): { code: number; out: string } {
  try {
    const out = execFileSync(
      "node",
      [script, "--features-dir", dir, "--feature", feature, ...extra],
      { encoding: "utf8", stdio: "pipe" }
    );
    return { code: 0, out };
  } catch (err: unknown) {
    const e = err as { status?: number; stdout?: string; stderr?: string };
    return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

function writeFeature(root: string, name: string, spec: string) {
  const dir = path.join(root, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "feature.spec.md"), spec);
  writeFileSync(path.join(dir, "tasks.md"), "# t\n");
  writeFileSync(path.join(dir, "acceptance.md"), "# a\n");
}

const BODY = (nonGoals: string, context: string, traceability: string) => `# Feature: f
## Context
${context}
## Problem
x
## Goals
x
## ${nonGoals}
x
## Scenarios
x
## Acceptance Criteria
- **AC1** — The system SHALL x.
## Traceability
${traceability}
`;

describe("C4: validate-spec-structure section-title tolerance", () => {
  it("accepts a canonical title with a trailing qualifier", () => {
    const root = mkdtempSync(path.join(tmpdir(), "sdd-c4-"));
    try {
      writeFeature(root, "f", BODY("Non-Goals (out of scope)", "x", "- x"));
      expect(run(VALIDATE, root, "f").code).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("still rejects a glued word that only looks like the title", () => {
    const root = mkdtempSync(path.join(tmpdir(), "sdd-c4b-"));
    try {
      // "## Non-Goalsy" must NOT satisfy the required "Non-Goals" section
      writeFeature(root, "f", BODY("Non-Goalsy", "x", "- x"));
      const { code, out } = run(VALIDATE, root, "f");
      expect(code).toBe(1);
      expect(out).toContain("Non-Goals");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("validate-spec-structure --strict (clarification markers)", () => {
  it("warns (exit 0) by default but fails (exit 1) with --strict on an open marker", () => {
    const root = mkdtempSync(path.join(tmpdir(), "sdd-strict-"));
    try {
      writeFeature(
        root,
        "f",
        BODY("Non-Goals", "Open: [NEEDS CLARIFICATION: which env?]", "- x")
      );
      expect(run(VALIDATE, root, "f").code).toBe(0); // default: warn, non-blocking
      const strict = run(VALIDATE, root, "f", ["--strict"]);
      expect(strict.code).toBe(1);
      expect(strict.out).toContain("NEEDS CLARIFICATION");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("C3: map-spec-to-code scopes traceability to the Traceability section", () => {
  it("ignores a hypothetical src/ path mentioned in prose", () => {
    const root = mkdtempSync(path.join(tmpdir(), "sdd-c3-"));
    try {
      writeFeature(
        root,
        "f",
        BODY(
          "Non-Goals",
          "Later we might add `src/features/not-built-yet/index.ts`.",
          "- Spec: `specs/templates/feature.spec.template.md`"
        )
      );
      // the prose src/ path is no longer treated as a link; the real one exists
      expect(run(MAP, root, "f").code).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("still fails on a broken path inside the Traceability section", () => {
    const root = mkdtempSync(path.join(tmpdir(), "sdd-c3b-"));
    try {
      writeFeature(root, "f", BODY("Non-Goals", "x", "- Impl: `src/nope-does-not-exist.ts`"));
      expect(run(MAP, root, "f").code).toBe(1);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
