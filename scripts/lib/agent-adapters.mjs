// Pure helpers for projecting the canonical sdd/ source into per-agent adapters.
// Logic lives here (testable); build-agent-adapters.mjs is the thin I/O wrapper.

import {
  readFileSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import path from "node:path";

export const ALL_AGENTS = ["claude", "codex", "opencode"];

/**
 * Parse `--- ... ---` YAML-ish frontmatter into { data, body }. Only flat
 * `key: value` pairs are supported (enough for command metadata).
 */
export function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { data: {}, body: text };
  const data = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    if (key) data[key] = line.slice(idx + 1).trim();
  }
  return { data, body: text.slice(match[0].length) };
}

/** Render a flat object as `--- key: value ---` frontmatter (empty -> ""). */
export function renderFrontmatter(data) {
  const keys = Object.keys(data);
  if (keys.length === 0) return "";
  return "---\n" + keys.map((k) => `${k}: ${data[k]}`).join("\n") + "\n---\n";
}

/**
 * Read the canonical source tree into memory.
 * Returns { commands: [{name, text}], skills: [{name, files:[{rel,content}], codexYaml}] }
 */
export function readCanonical(sddDir) {
  const commandsDir = path.join(sddDir, "commands");
  const commands = readdirSync(commandsDir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => ({
      name: f.replace(/\.md$/, ""),
      text: readFileSync(path.join(commandsDir, f), "utf8"),
    }));

  const skillsDir = path.join(sddDir, "skills");
  const skills = readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .map((name) => {
      const files = [];
      let codexYaml = null;
      const walk = (dir, rel) => {
        const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
          a.name < b.name ? -1 : 1
        );
        for (const entry of entries) {
          const abs = path.join(dir, entry.name);
          const r = rel ? path.posix.join(rel, entry.name) : entry.name;
          if (entry.isDirectory()) walk(abs, r);
          else if (r === "codex.yaml") codexYaml = readFileSync(abs, "utf8");
          else files.push({ rel: r, content: readFileSync(abs, "utf8") });
        }
      };
      walk(path.join(skillsDir, name), "");
      return { name, files, codexYaml };
    });

  return { commands, skills };
}

/**
 * Build a deterministic projection plan: an array of { to, content } actions
 * (paths are POSIX, relative to the target dir), sorted by path. Pure function.
 */
export function buildPlan({ canonical, manifest, agents }) {
  const actions = [];
  for (const agent of agents) {
    const cfg = manifest.agents[agent];
    if (!cfg) continue;

    if (cfg.commands) {
      for (const cmd of canonical.commands) {
        const { data, body } = parseFrontmatter(cmd.text);
        const fm = {};
        if (data.description) fm.description = data.description;
        actions.push({
          to: path.posix.join(cfg.commands, `${cmd.name}.md`),
          content: renderFrontmatter(fm) + body,
        });
      }
    }

    if (cfg.skills) {
      for (const skill of canonical.skills) {
        for (const file of skill.files) {
          actions.push({
            to: path.posix.join(cfg.skills, skill.name, file.rel),
            content: file.content,
          });
        }
        if (cfg.skillsOpenaiYaml && skill.codexYaml != null) {
          actions.push({
            to: path.posix.join(cfg.skills, skill.name, "agents", "openai.yaml"),
            content: skill.codexYaml,
          });
        }
      }
    }

    if (cfg.root) {
      for (const [name, content] of Object.entries(cfg.root)) {
        actions.push({ to: name, content });
      }
    }
  }
  actions.sort((a, b) => (a.to < b.to ? -1 : a.to > b.to ? 1 : 0));
  return actions;
}

/**
 * Execute a plan: write each action under targetDir, creating dirs as needed.
 * With `force: false`, existing files are skipped (not overwritten).
 * Returns { written, skipped } lists of relative paths.
 */
export function writeActions(actions, targetDir, { force = true } = {}) {
  const written = [];
  const skipped = [];
  for (const action of actions) {
    const full = path.join(targetDir, action.to);
    if (!force && existsSync(full)) {
      skipped.push(action.to);
      continue;
    }
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, action.content);
    written.push(action.to);
  }
  return { written, skipped };
}
