import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const INSTALLER = path.resolve("scripts/install-sdd-skeleton.mjs");

function install(target: string, agents: string) {
  execFileSync("node", [INSTALLER, "--target", target, "--agents", agents], {
    stdio: "pipe",
  });
}

describe("install-sdd-skeleton --agents (selective projection)", () => {
  it("opencode: projects .opencode + .agents/skills, never .claude; agnostic assets always", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "sdd-install-oc-"));
    try {
      install(dir, "opencode");
      // selected agent
      expect(existsSync(path.join(dir, ".opencode/command/sdd-init.md"))).toBe(true);
      expect(existsSync(path.join(dir, ".agents/skills/spec-author/SKILL.md"))).toBe(true);
      // unselected agent must not be written (AC9)
      expect(existsSync(path.join(dir, ".claude"))).toBe(false);
      expect(existsSync(path.join(dir, "CLAUDE.md"))).toBe(false);
      // agent-agnostic assets always installed (AC10)
      expect(existsSync(path.join(dir, "AGENTS.md"))).toBe(true);
      expect(existsSync(path.join(dir, "specs/templates/feature.spec.template.md"))).toBe(true);
      expect(existsSync(path.join(dir, "package.json"))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("claude: projects .claude + CLAUDE.md, never .opencode", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "sdd-install-cl-"));
    try {
      install(dir, "claude");
      expect(existsSync(path.join(dir, ".claude/commands/sdd-init.md"))).toBe(true);
      expect(existsSync(path.join(dir, ".claude/skills/spec-author/SKILL.md"))).toBe(true);
      expect(existsSync(path.join(dir, "CLAUDE.md"))).toBe(true);
      expect(existsSync(path.join(dir, ".opencode"))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
