import { describe, it, expect } from "vitest";
import {
  parseSemver,
  bumpSemver,
  parseCommitLine,
  buildChangelogBody,
} from "../../sdd/skills/release-manager/scripts/release-lib.mjs";

describe("parseSemver", () => {
  it("parses plain and v-prefixed versions", () => {
    expect(parseSemver("1.2.3")).toMatchObject({ major: 1, minor: 2, patch: 3, suffix: "" });
    expect(parseSemver("v1.2.3").normalized).toBe("1.2.3");
  });
  it("tolerates a pre-release / build suffix (the bug that crashed the bump)", () => {
    expect(parseSemver("1.2.3-rc.1")).toMatchObject({ major: 1, minor: 2, patch: 3, suffix: "-rc.1" });
    expect(parseSemver("1.2.3+build.5").suffix).toBe("+build.5");
  });
  it("throws a clear error on missing or invalid input", () => {
    expect(() => parseSemver(undefined as unknown as string)).toThrow(/version/i);
    expect(() => parseSemver("")).toThrow(/version/i);
    expect(() => parseSemver("not-a-version")).toThrow(/Invalid semver/);
  });
});

describe("bumpSemver", () => {
  it("bumps the core x.y.z", () => {
    expect(bumpSemver("1.2.3", "major")).toBe("2.0.0");
    expect(bumpSemver("1.2.3", "minor")).toBe("1.3.0");
    expect(bumpSemver("1.2.3", "patch")).toBe("1.2.4");
  });
  it("bumps a pre-release current version by its core (no crash)", () => {
    expect(bumpSemver("1.2.3-rc.1", "patch")).toBe("1.2.4");
  });
  it("rejects an invalid bump type", () => {
    expect(() => bumpSemver("1.2.3", "huge" as "patch")).toThrow(/major, minor, patch/);
  });
});

describe("parseCommitLine", () => {
  it("splits on the FIRST tab only, preserving a tab in the subject", () => {
    const c = parseCommitLine("abc123\tfeat: add\textra");
    expect(c.hash).toBe("abc123");
    expect(c.subject).toBe("feat: add\textra");
    expect(c.description).toBe("add\textra");
  });
  it("recognizes conventional type, scope and breaking marker", () => {
    expect(parseCommitLine("h\tfeat(api)!: x")).toMatchObject({
      type: "feat",
      breaking: true,
      description: "x",
    });
  });
  it("falls back to other for non-conventional subjects", () => {
    const c = parseCommitLine("h\twip stuff");
    expect(c.type).toBeNull();
    expect(c.description).toBe("wip stuff");
  });
});

describe("buildChangelogBody", () => {
  const lines = [
    "h1\tfeat: a feature",
    "h2\tbuild: bump dep",
    "h3\tci: add workflow",
    "h4\trevert: undo x",
    "h5\tfeat!: breaking thing",
    "h6\tfix: a\twith tab",
  ];
  const body = buildChangelogBody("v1.1.0", "2026-06-14", lines);

  it("buckets build / ci / revert into their own sections (not Other)", () => {
    expect(body).toMatch(/### Build\n- bump dep/);
    expect(body).toMatch(/### CI\n- add workflow/);
    expect(body).toMatch(/### Reverts\n- undo x/);
    expect(body).not.toContain("### Other");
  });
  it("surfaces a breaking change in its own section", () => {
    expect(body).toMatch(/### Breaking Changes\n- breaking thing/);
  });
  it("preserves a tab inside a commit subject", () => {
    expect(body).toContain("- a\twith tab");
  });
  it("starts with the tag/date heading", () => {
    expect(body.startsWith("## v1.1.0 - 2026-06-14")).toBe(true);
  });
});
