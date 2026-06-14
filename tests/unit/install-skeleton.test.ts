import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  existsSync,
  rmSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { mergeGitignore, CONSUMER_GITIGNORE } from "../../scripts/lib/gitignore.mjs";

const INSTALLER = path.resolve("scripts/install-sdd-skeleton.mjs");

function install(target: string, agents: string, extra: string[] = []) {
  execFileSync("node", [INSTALLER, "--target", target, "--agents", agents, ...extra], {
    stdio: "pipe",
  });
}

function tryInstall(target: string, agents: string, extra: string[] = []): { code: number; out: string } {
  try {
    const out = execFileSync(
      "node",
      [INSTALLER, "--target", target, "--agents", agents, ...extra],
      { encoding: "utf8", stdio: "pipe" }
    );
    return { code: 0, out };
  } catch (err: unknown) {
    const e = err as { status?: number; stdout?: string; stderr?: string };
    return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
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
      // fresh-install-correctness: .gitignore created + specs/features scaffolded
      expect(existsSync(path.join(dir, "specs/features/.gitkeep"))).toBe(true);
      const gi = readFileSync(path.join(dir, ".gitignore"), "utf8");
      expect(gi).toContain("node_modules/");
      // target commits its adapters -> consumer .gitignore must not ignore them
      expect(gi).not.toContain(".opencode");
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

describe("install onto an existing project (Tier B: idempotency & safety)", () => {
  const USER_TSCONFIG = '{"compilerOptions":{"strict":true}}\n';

  it("completes without aborting and leaves an existing file untouched", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "sdd-exist-"));
    try {
      writeFileSync(path.join(dir, "tsconfig.json"), USER_TSCONFIG);
      const { code } = tryInstall(dir, "claude");
      expect(code).toBe(0); // no mid-abort (AC3)
      // user's file preserved (AC1)
      expect(readFileSync(path.join(dir, "tsconfig.json"), "utf8")).toBe(USER_TSCONFIG);
      // the rest of the flow still ran: agnostic asset + adapters present
      expect(existsSync(path.join(dir, "AGENTS.md"))).toBe(true);
      expect(existsSync(path.join(dir, ".claude/commands/sdd-init.md"))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("--force overwrites an existing file", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "sdd-force-"));
    try {
      writeFileSync(path.join(dir, "tsconfig.json"), USER_TSCONFIG);
      install(dir, "claude", ["--force"]);
      expect(readFileSync(path.join(dir, "tsconfig.json"), "utf8")).not.toBe(USER_TSCONFIG);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("is idempotent: a second run adds nothing", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "sdd-idem-"));
    try {
      install(dir, "claude");
      const { code, out } = tryInstall(dir, "claude");
      expect(code).toBe(0);
      expect(out).toMatch(/0 added/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("rejects an unknown --agents value before writing anything (AC5)", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "sdd-badagent-"));
    try {
      const { code } = tryInstall(dir, "clade");
      expect(code).not.toBe(0);
      expect(existsSync(path.join(dir, "AGENTS.md"))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("mergeGitignore (consumer .gitignore)", () => {
  it("creates a full ignore set when there is none", () => {
    const result = mergeGitignore(null);
    for (const entry of CONSUMER_GITIGNORE) expect(result).toContain(entry);
    expect(mergeGitignore("")).toBe(mergeGitignore(null));
  });

  it("appends only missing entries and keeps existing lines intact", () => {
    const existing = "node_modules/\nmy-secret.env\n";
    const result = mergeGitignore(existing);
    expect(result.startsWith(existing)).toBe(true); // user lines untouched
    expect(result).toContain("my-secret.env");
    expect(result).toContain("coverage/"); // a missing one was added
    // an already-present entry is not duplicated
    expect(result.match(/node_modules\//g)?.length).toBe(1);
  });

  it("is idempotent when all entries are already present", () => {
    const full = mergeGitignore(null);
    expect(mergeGitignore(full)).toBe(full);
  });
});
