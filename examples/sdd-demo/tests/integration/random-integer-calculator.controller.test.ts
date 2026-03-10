import { describe, expect, it } from "vitest";
import { runRandomIntegerCalculatorFeature } from "../../src/features/random-integer-calculator/index.js";

/** Regex para formato exacto "<a> + <b> = <c>" con enteros. */
const LINE_FORMAT = /^(\d+) \+ (\d+) = (\d+)$/;

describe("runRandomIntegerCalculatorFeature", () => {
  it("returns a single line with exact format <a> + <b> = <c>", () => {
    const line = runRandomIntegerCalculatorFeature();
    expect(line).toMatch(LINE_FORMAT);
    expect(line.split("\n")).toHaveLength(1);
  });

  it("output parses to valid operands and correct sum", () => {
    for (let i = 0; i < 30; i++) {
      const line = runRandomIntegerCalculatorFeature();
      const match = line.match(LINE_FORMAT);
      expect(match).not.toBeNull();
      const a = Number(match![1]);
      const b = Number(match![2]);
      const c = Number(match![3]);
      expect(a + b).toBe(c);
      expect(a).toBeGreaterThanOrEqual(2);
      expect(a).toBeLessThanOrEqual(200);
      expect(b).toBeGreaterThanOrEqual(2);
      expect(b).toBeLessThanOrEqual(200);
    }
  });
});
