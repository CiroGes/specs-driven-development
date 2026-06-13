# Tasks: agent-adapter-projection

> Executable plan from `/sdd-plan`. Ordered, no hidden decisions. Each task lists
> files + the `AC<n>` it covers. Implementation handed to `/sdd-implement`.

## Projection design (decisions, made explicit)

**Canonical source layout (`sdd/`):**
- `sdd/commands/<name>.md` — agent-neutral command: YAML frontmatter with neutral
  keys (`description`, optional `argument_hint`) + the markdown body (prompt).
- `sdd/skills/<name>/SKILL.md` (+ `references/`, `scripts/`) — already
  agent-neutral (`name`, `description` + body). Optional `sdd/skills/<name>/codex.yaml`
  carries the Codex interface (`display_name`, `short_description`, `default_prompt`).

**Projection manifest (`sdd/agents.manifest.json`):** declares, per agent, where
each artifact kind goes and how its frontmatter is shaped.

| Artifact | claude | codex | opencode |
|----------|--------|-------|----------|
| commands | `.claude/commands/<n>.md` (fm: `description`, `argument-hint`); body uses `$ARGUMENTS` | — (Codex has no repo-local commands) | `.opencode/command/<n>.md` (fm: `description`, optional `agent`/`subtask`); `$ARGUMENTS` |
| skills | `.claude/skills/<n>/` (copy tree) | `.agents/skills/<n>/` (copy tree + emit `agents/openai.yaml` from `codex.yaml`) | `.agents/skills/<n>/` (copy tree; opencode reads it) |
| root rules | `CLAUDE.md` (generated `@AGENTS.md`) | — (reads `AGENTS.md`) | — (reads `AGENTS.md`) |

Notes:
- `AGENTS.md` is hand-written and agent-agnostic → **not** generated, always present.
- Commands project only to `claude` and `opencode` (Codex has no repo-local commands).
- Skills for `codex` and `opencode` share `.agents/skills/`; `openai.yaml` is added by
  the codex emitter. If only `opencode` is selected, skills still go to `.agents/skills/`
  (without `openai.yaml`).
- Placeholder rewrite: neutral body uses `$ARGUMENTS`; both claude and opencode accept it,
  so no rewrite needed today — but the projector SHALL route placeholder mapping through the
  manifest so a future agent needing `{{args}}` is a data change, not code.

**Projector behavior:** read canonical artifact → for each selected agent, copy
body, apply that agent's frontmatter keys from the manifest, write to the mapped
path. Deterministic (stable key order, no timestamps).

## Ordered tasks

### Phase 1 — Canonical source

- [x] **T1** Create `sdd/commands/<name>.md` for the 7 commands: move bodies from
  `.claude/commands/`, replacing Claude frontmatter with neutral frontmatter
  (`description`, `argument_hint`). (AC1)
- [x] **T2** Move the 3 skills into `sdd/skills/<name>/` (SKILL.md + references +
  scripts); add `sdd/skills/<name>/codex.yaml` from the current
  `.agents/skills/<name>/agents/openai.yaml`. (AC1)

### Phase 2 — Manifest + projector + emitters

- [x] **T3** Author `sdd/agents.manifest.json` per the design table (agents,
  artifact→path/format/frontmatter, placeholder mapping). (AC2, AC11)
- [x] **T4** Implement `scripts/build-agent-adapters.mjs` + `scripts/lib/` helpers:
  parse canonical artifacts, project per selected agent, deterministic output.
  Accept `--agents <list>` and `--target <dir>` (default: repo root). (AC3, AC15)
- [x] **T5** Implement per-agent emitters: claude (commands + skills + `CLAUDE.md`),
  codex (skills + generated `agents/openai.yaml`), opencode (commands + skills to
  `.agents/skills/`). (AC12, AC13, AC14)
- [x] **T6** Unit tests `tests/unit/build-agent-adapters.test.ts`: frontmatter
  rewrite, path mapping per agent, selection (only chosen written), determinism
  (two runs identical). (AC3, AC9, AC12, AC13, AC14, AC15, AC16)

### Phase 3 — Git-ignore + local build + migration

- [x] **T7** Add `.gitignore` entries for generated `.claude/`, `.agents/skills/`,
  `.opencode/`, and generated `CLAUDE.md`. (AC4)
- [x] **T8** Add `adapters:build` npm script (no `--agents` = all agents) and a
  `prepare` script that runs it on `npm install`. (AC5, AC6)
- [x] **T9** Remove the now-committed adapters from git tracking (`.claude/`,
  `.agents/skills/`, `CLAUDE.md`) and regenerate them via the build to confirm the
  repo still works for Claude + Codex + opencode. (AC4, AC5)

### Phase 4 — Selective installer

- [x] **T10** Split `skeleton.manifest.json` into agent-agnostic assets (always
  copied) vs. per-agent (projected). (AC10)
- [x] **T11** Extend `scripts/install-sdd-skeleton.mjs`: `--agents <list>` flag;
  interactive prompt when absent on a TTY; project only selected agents via the
  same projector; always copy agent-agnostic assets. (AC7, AC8, AC9, AC10)
- [x] **T12** Installer tests (or projector-in-target tests): `--agents
  claude,opencode` writes only those; unselected agent's files absent;
  agent-agnostic assets always present. (AC7, AC9, AC10)

### Phase 5 — Docs + self-consistency

- [x] **T13** Update `README.md` and `docs/conventions.md`: canonical-source +
  build/projection model, `--agents` install, the `.opencode/` layout. Mark
  opencode + projection delivered in `docs/roadmap.md`. (AC1)
- [x] **T14** Run `adapters:build` + full verify suite + `coverage:specs` on the
  demo and on `specs/features` (this feature 16/16). (AC5, AC15)
- [x] **T15** Reconcile `acceptance.md` with final test names.

## Risks

- **R1 — Migration gap.** Moving committed `.claude/` into `sdd/` means the repo's
  own Claude commands disappear until the projector + build exist. *Mitigation:*
  land Phases 1-3 together; `/sdd-implement` is one flow; AGENTS.md keeps rules live
  throughout.
- **R2 — `prepare` surprises.** A `prepare` that builds on every `npm install`
  could confuse contributors. *Mitigation:* make it idempotent/quiet; document it;
  ensure it no-ops cleanly if canonical source is missing.
- **R3 — Frontmatter drift across agents.** Hand-mapping frontmatter could diverge
  from each agent's real schema. *Mitigation:* keep mappings in the manifest (data),
  cover with T6; opencode/claude command frontmatter confirmed from docs.
- **R4 — `openai.yaml` generation fidelity.** Generating Codex interface from
  `codex.yaml` must preserve current `default_prompt`s. *Mitigation:* carry
  `codex.yaml` verbatim in canonical (T2), emitter copies/renames it.
- **R5 — Installer dual-purpose projector.** Building into repo vs. into a target
  dir share logic; path handling could leak. *Mitigation:* projector takes an
  explicit `--target`; installer passes the target; tests cover both.
- **R6 — opencode `.opencode/command` frontmatter.** opencode-specific keys
  (`agent`/`subtask`) are optional; emit minimal valid frontmatter (`description`).

## Dependencies

- Phase 1 (canonical) precedes the projector (Phase 2), which precedes git-ignore +
  migration (Phase 3) and the installer (Phase 4).
- T9 (remove committed adapters) depends on T4/T5/T8 working (else the repo breaks).
- T11 (installer) reuses the T4 projector with a `--target`.
- No dependency on `src/features/` runtime code.

## Manual verification (per plan convention)

```bash
npm run adapters:build                                          # all agents, local
npm run adapters:build -- --agents opencode                     # one agent
npm run install:skeleton -- --agents claude,opencode --target /tmp/probe
```
