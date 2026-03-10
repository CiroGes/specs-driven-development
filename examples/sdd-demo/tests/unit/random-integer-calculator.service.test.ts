import { describe, expect, it } from "vitest";
import {
  add,
  getTwoRandomOperands,
  computeRandomSum,
  MIN_OPERAND,
  MAX_OPERAND,
} from "../../src/features/random-integer-calculator/random-integer-calculator.service.js";

describe("add", () => {
  it("returns sum of two numbers", () => {
    expect(add(2, 3)).toBe(5);
    expect(add(200, 200)).toBe(400);
    expect(add(2, 200)).toBe(202);
  });
});

describe("getTwoRandomOperands", () => {
  it("returns two integers within default range 2..200", () => {
    for (let i = 0; i < 100; i++) {
      const [a, b] = getTwoRandomOperands();
      expect(Number.isInteger(a)).toBe(true);
      expect(Number.isInteger(b)).toBe(true);
      expect(a).toBeGreaterThanOrEqual(MIN_OPERAND);
      expect(a).toBeLessThanOrEqual(MAX_OPERAND);
      expect(b).toBeGreaterThanOrEqual(MIN_OPERAND);
      expect(b).toBeLessThanOrEqual(MAX_OPERAND);
    }
  });

  it("respects custom min/max when provided", () => {
    const min = 10;
    const max = 20;
    for (let i = 0; i < 50; i++) {
      const [a, b] = getTwoRandomOperands(min, max);
      expect(a).toBeGreaterThanOrEqual(min);
      expect(a).toBeLessThanOrEqual(max);
      expect(b).toBeGreaterThanOrEqual(min);
      expect(b).toBeLessThanOrEqual(max);
    }
  });
});

describe("computeRandomSum", () => {
  it("returns a, b and sum with correct sum", () => {
    for (let i = 0; i < 50; i++) {
      const result = computeRandomSum();
      expect(result.a + result.b).toBe(result.sum);
      expect(result.a).toBeGreaterThanOrEqual(MIN_OPERAND);
      expect(result.a).toBeLessThanOrEqual(MAX_OPERAND);
      expect(result.b).toBeGreaterThanOrEqual(MIN_OPERAND);
      expect(result.b).toBeLessThanOrEqual(MAX_OPERAND);
    }
  });
});
