import { describe, it, expect } from "vitest";
import { findClarificationMarkers, stripCode } from "../../scripts/lib/spec-parsing.mjs";

describe("findClarificationMarkers", () => {
  it("finds a live marker written in prose", () => {
    const text = "The range is 2-200 [NEEDS CLARIFICATION: is it inclusive?]";
    expect(findClarificationMarkers(text)).toEqual([
      "[NEEDS CLARIFICATION: is it inclusive?]",
    ]);
  });

  it("ignores a marker inside an inline code span", () => {
    const text = "Use the `[NEEDS CLARIFICATION: ...]` marker convention.";
    expect(findClarificationMarkers(text)).toEqual([]);
  });

  it("ignores a marker inside a fenced code block", () => {
    const text = [
      "Example:",
      "```",
      "[NEEDS CLARIFICATION: should this fail?]",
      "```",
    ].join("\n");
    expect(findClarificationMarkers(text)).toEqual([]);
  });

  it("returns an empty array when there is no marker", () => {
    expect(findClarificationMarkers("A clean spec with no open questions.")).toEqual([]);
  });

  it("finds multiple live markers", () => {
    const text =
      "First [NEEDS CLARIFICATION: a?] then later [NEEDS CLARIFICATION: b?].";
    expect(findClarificationMarkers(text)).toEqual([
      "[NEEDS CLARIFICATION: a?]",
      "[NEEDS CLARIFICATION: b?]",
    ]);
  });

  it("distinguishes a live marker from a documented one in the same text", () => {
    const text =
      "Write a `[NEEDS CLARIFICATION]` marker. Open: [NEEDS CLARIFICATION: which env?]";
    expect(findClarificationMarkers(text)).toEqual([
      "[NEEDS CLARIFICATION: which env?]",
    ]);
  });

  it("preserves backtick content inside a live marker (detect-first, no blanking)", () => {
    const text = "Open: [NEEDS CLARIFICATION: use `npm` or `pnpm`?]";
    expect(findClarificationMarkers(text)).toEqual([
      "[NEEDS CLARIFICATION: use `npm` or `pnpm`?]",
    ]);
  });
});

describe("stripCode", () => {
  it("removes inline code spans and fenced blocks", () => {
    const text = "keep `drop` keep\n```\ndrop\n```\nkeep";
    const result = stripCode(text);
    expect(result).toContain("keep");
    expect(result).not.toContain("drop");
  });
});
