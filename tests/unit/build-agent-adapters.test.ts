import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  parseFrontmatter,
  renderFrontmatter,
  readCanonical,
  buildPlan,
  writeActions,
  ALL_AGENTS,
} from "../../scripts/lib/agent-adapters.mjs";

const manifest = {
  agents: {
    claude: { commands: ".claude/commands", skills: ".claude/skills", root: { "CLAUDE.md": "@AGENTS.md\n" } },
    codex: { skills: ".agents/skills", skillsOpenaiYaml: true },
    opencode: { commands: ".opencode/command", skills: ".agents/skills" },
  },
};

const canonical = {
  commands: [{ name: "sdd-init", text: "---\ndescription: Bootstrap a feature.\n---\n# SDD Init\nbody\n" }],
  skills: [
    {
      name: "spec-author",
      files: [{ rel: "SKILL.md", content: "---\nname: spec-author\n---\nbody\n" }],
      codexYaml: "version: 1\ninterface:\n  display_name: Spec Author\n",
    },
  ],
};

describe("frontmatter", () => {
  it("parses and re-renders flat frontmatter", () => {
    const { data, body } = parseFrontmatter("---\ndescription: hi\n---\nbody\n");
    expect(data).toEqual({ description: "hi" });
    expect(body).toBe("body\n");
    expect(renderFrontmatter({ description: "hi" })).toBe("---\ndescription: hi\n---\n");
  });
  it("returns body unchanged when there is no frontmatter", () => {
    expect(parseFrontmatter("no fm").body).toBe("no fm");
    expect(renderFrontmatter({})).toBe("");
  });
});

describe("buildPlan", () => {
  it("claude: commands + skills + CLAUDE.md", () => {
    const tos = buildPlan({ canonical, manifest, agents: ["claude"] }).map((a) => a.to);
    expect(tos).toContain(".claude/commands/sdd-init.md");
    expect(tos).toContain(".claude/skills/spec-author/SKILL.md");
    expect(tos).toContain("CLAUDE.md");
    expect(tos.some((t) => t.includes("openai.yaml"))).toBe(false);
  });

  it("codex: skills + generated openai.yaml, NO commands", () => {
    const tos = buildPlan({ canonical, manifest, agents: ["codex"] }).map((a) => a.to);
    expect(tos).toContain(".agents/skills/spec-author/SKILL.md");
    expect(tos).toContain(".agents/skills/spec-author/agents/openai.yaml");
    expect(tos.some((t) => t.includes("/command"))).toBe(false);
  });

  it("opencode: commands + skills in .agents/skills, no openai.yaml", () => {
    const tos = buildPlan({ canonical, manifest, agents: ["opencode"] }).map((a) => a.to);
    expect(tos).toContain(".opencode/command/sdd-init.md");
    expect(tos).toContain(".agents/skills/spec-author/SKILL.md");
    expect(tos.some((t) => t.includes("openai.yaml"))).toBe(false);
  });

  it("selecting one agent never writes another agent's paths", () => {
    const tos = buildPlan({ canonical, manifest, agents: ["opencode"] }).map((a) => a.to);
    expect(tos.some((t) => t.startsWith(".claude/"))).toBe(false);
  });

  it("is deterministic (two runs identical, sorted)", () => {
    const a = buildPlan({ canonical, manifest, agents: ALL_AGENTS });
    const b = buildPlan({ canonical, manifest, agents: ALL_AGENTS });
    expect(a).toEqual(b);
    expect(a.map((x) => x.to)).toEqual([...a.map((x) => x.to)].sort());
  });

  it("command output carries the description frontmatter and body", () => {
    const cmd = buildPlan({ canonical, manifest, agents: ["claude"] }).find(
      (a) => a.to === ".claude/commands/sdd-init.md"
    );
    expect(cmd?.content).toContain("description: Bootstrap a feature.");
    expect(cmd?.content).toContain("# SDD Init");
  });
});

describe("round-trip against the real sdd/ canonical", () => {
  it("projects all agents into a target dir with the expected files", () => {
    const realManifest = JSON.parse(readFileSync("sdd/agents.manifest.json", "utf8"));
    const real = readCanonical("sdd");
    const actions = buildPlan({ canonical: real, manifest: realManifest, agents: ALL_AGENTS });
    const dir = mkdtempSync(path.join(tmpdir(), "sdd-proj-"));
    try {
      writeActions(actions, dir);
      expect(existsSync(path.join(dir, ".claude/commands/sdd-init.md"))).toBe(true);
      expect(existsSync(path.join(dir, ".claude/skills/spec-author/SKILL.md"))).toBe(true);
      expect(existsSync(path.join(dir, "CLAUDE.md"))).toBe(true);
      expect(existsSync(path.join(dir, ".agents/skills/spec-author/agents/openai.yaml"))).toBe(true);
      expect(existsSync(path.join(dir, ".opencode/command/sdd-init.md"))).toBe(true);
      // opencode-only skills live under .agents/skills (shared), not .opencode/skills
      expect(existsSync(path.join(dir, ".opencode/skills"))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
