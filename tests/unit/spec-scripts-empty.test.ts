import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const SCRIPTS = {
  "validate:specs": path.resolve("scripts/validate-spec-structure.mjs"),
  "map:specs": path.resolve("scripts/map-spec-to-code.mjs"),
  "coverage:specs": path.resolve("scripts/check-spec-coverage.mjs"),
};

function run(script: string, featuresDir: string): { code: number; out: string } {
  try {
    const out = execFileSync("node", [script, "--features-dir", featuresDir], {
      encoding: "utf8",
      stdio: "pipe",
    });
    return { code: 0, out };
  } catch (err: unknown) {
    const e = err as { status?: number; stdout?: string; stderr?: string };
    return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

describe("spec scripts on an empty features dir (fresh install)", () => {
  for (const [name, script] of Object.entries(SCRIPTS)) {
    it(`${name} exits 0 with a "no features" notice`, () => {
      const dir = mkdtempSync(path.join(tmpdir(), "sdd-empty-"));
      try {
        const { code, out } = run(script, dir);
        expect(code).toBe(0);
        expect(out.toLowerCase()).toContain("no features yet");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  }
});
