# Feature: agent-adapter-projection

> Status: spec-authoring phase — clarifications resolved, ready for `/sdd-plan`.
> Acceptance criteria in EARS (dogfoods the spec-quality-gates convention).

## Context

The skeleton supports multiple agent tools, but today it does so by **committing
duplicated adapter trees**: the three skills live in both `.claude/skills/` and
`.agents/skills/`, hand-synced (the `spec-quality-gates` retro flagged this as
"skill drift", R4). The installer copies all adapters into a target project,
overloading it with files for agents the user does not use.

A state-of-the-art benchmark (GitHub Spec Kit `--integration`, gentle-ai's TUI
configurator, opencode docs) shows the cleaner pattern: keep ONE canonical,
agent-agnostic source and **project** it into per-agent layouts at build/install
time, letting the user select which agent(s) to target.

Two findings make adding opencode cheap:
- opencode reads `AGENTS.md` natively (falls back to `CLAUDE.md`).
- opencode reads `.claude/skills/` and `.agents/skills/` directly, so it needs no
  dedicated skills copy — only `.opencode/command/*.md` (with opencode frontmatter).

## Problem

- The same skill is maintained in two trees by hand → drift risk.
- Installing the skeleton copies every agent's adapter, bloating targets.
- Adding a new agent (opencode) under the current model would add a THIRD hand-synced
  copy — exactly the wrong direction.

## Goals

- Maintain commands and skills in a single canonical, agent-agnostic source.
- Generate per-agent adapter files by projection (path + format + frontmatter),
  so divergence is data in a manifest, not duplicated files.
- Let the user select agents at install and project ONLY those into the target.
- Add `opencode` as a first-class target alongside `claude` and `codex`.
- Keep the canonical source as the only committed truth; generated adapters are
  git-ignored and rebuilt on demand (no committed duplication, no drift-check).

## Non-Goals

- No drift-check or skeleton-build logic added to `/sdd-verify` (out of its scope:
  it validates a feature, not the skeleton's build). Integrity is covered by unit
  tests of the projector instead.
- No opencode `.opencode/agent/*.md` scope-boundary agents in this increment
  (a powerful future option — `permission: {edit: deny}` to enforce scope — but
  deferred to keep this lean).
- No new agents beyond `claude`, `codex`, `opencode`.
- No MCP wiring (the context server was already removed).
- No change to `AGENTS.md` as the hand-written, agent-agnostic rules source (it is
  NOT a generated adapter; all agents read it directly).

## Scenarios

1. **De-dup at the source.** A maintainer edits one skill under `sdd/skills/<name>/`;
   building regenerates every agent's copy — no second hand-edit.
2. **Selective install (new project).** `install:skeleton --agents claude,opencode
   --target ../app` projects only Claude and opencode adapters; no `.agents/`-only
   Codex artifacts appear unless Codex was selected.
3. **Interactive install.** Running `install:skeleton` with no `--agents` on a TTY
   prompts which agents to set up.
4. **Existing project.** Re-running the installer on an existing project adds the
   selected agents' adapters without overwriting unrelated files (current
   conservative behavior preserved).
5. **Local skeleton dev.** A contributor clones the repo and runs the build (or it
   runs on `npm install`); adapters for all agents appear locally (git-ignored), so
   they can iterate using whichever agent they prefer.

## Acceptance Criteria

### A. Canonical source + projector

- **AC1** — The skeleton SHALL keep a single canonical, agent-agnostic source for
  commands and skills under `sdd/` with no per-agent duplication committed.
- **AC2** — The skeleton SHALL define a projection manifest mapping each canonical
  artifact to each supported agent's output path, file format, and frontmatter.
- **AC3** — WHEN the projector runs for a selected agent, it SHALL generate that
  agent's adapter files from the canonical source and manifest, applying the
  agent's frontmatter and rewriting argument placeholders.
- **AC4** — The generated adapter directories (`.claude/`, `.agents/skills/`,
  `.opencode/`, generated `CLAUDE.md`) SHALL be git-ignored.

### B. Local skeleton development

- **AC5** — WHEN `npm run adapters:build` runs with no agent filter, it SHALL
  generate adapters for all supported agents into the local tree.
- **AC6** — WHEN `npm install` runs in the skeleton repo, a `prepare` script SHALL
  run `adapters:build` so a fresh clone obtains working adapters with no manual step.

### C. Selective install

- **AC7** — WHEN `install:skeleton` runs with `--agents <list>`, it SHALL project
  only the listed agents' adapters into the target project.
- **AC8** — WHEN `install:skeleton` runs with no `--agents` flag on an interactive
  terminal, it SHALL prompt the user to choose agents.
- **AC9** — IF an agent was not selected THEN the installer SHALL NOT write that
  agent's adapter files into the target.
- **AC10** — The installer SHALL always install the agent-agnostic assets
  (`AGENTS.md`, `specs/templates/`, `docs/`, `scripts/`, config) regardless of
  agent selection.

### D. opencode support

- **AC11** — The supported agents SHALL be `claude`, `codex`, and `opencode`.
- **AC12** — WHEN `opencode` is selected, the projector SHALL emit
  `.opencode/command/*.md` with opencode-compatible frontmatter, and SHALL place
  skills under `.agents/skills/` (which opencode reads).
- **AC13** — WHEN `claude` is selected, the projector SHALL emit
  `.claude/commands/*.md`, `.claude/skills/<name>/`, and a `CLAUDE.md`.
- **AC14** — WHEN `codex` is selected, the projector SHALL emit
  `.agents/skills/<name>/` including each skill's `agents/openai.yaml`.

### E. Integrity

- **AC15** — WHEN the projector runs twice with no source change, it SHALL produce
  byte-identical output (deterministic).
- **AC16** — Unit tests SHALL cover projection behavior: frontmatter rewrite, path
  mapping, and per-agent selection.

## Clarifications (resolved)

1. **AC6 — fresh-clone build:** auto-build via a `prepare` npm script on
   `npm install` (zero friction). ✔ resolved
2. **Canonical layout:** the canonical home is `sdd/` — `sdd/commands/*.md` and
   `sdd/skills/<name>/`. ✔ resolved

## Traceability

This feature changes installer/tooling and restructures adapters; it does not add
`src/features/` runtime code. Implementation (`/sdd-implement`) is expected to touch:

- Canonical source (new): `sdd/commands/*.md`, `sdd/skills/<name>/` (moved from
  `.claude/commands` and `.claude/skills` / `.agents/skills`)
- Projection manifest (new): `sdd/agents.manifest.json` (or similar)
- Projector (new): `scripts/build-agent-adapters.mjs` + `scripts/lib/` helpers
- Installer: `scripts/install-sdd-skeleton.mjs` (agent selection + project only
  chosen), `skeleton.manifest.json` (agent-agnostic vs per-agent split)
- `package.json`: `adapters:build` script and `prepare` (pending AC6)
- `.gitignore`: ignore generated `.claude/`, `.agents/skills/`, `.opencode/`,
  generated `CLAUDE.md`
- Docs: `docs/conventions.md` / `README.md` (canonical-source + build model),
  `docs/roadmap.md` (mark opencode + projection delivered)
- Tests: `tests/unit/build-agent-adapters.test.ts`
- Spec tasks: `specs/features/agent-adapter-projection/tasks.md`
- Acceptance: `specs/features/agent-adapter-projection/acceptance.md`
