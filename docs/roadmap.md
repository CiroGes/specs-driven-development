# SDD Skeleton Roadmap

Forward-looking backlog for the skeleton itself (not for projects that adopt it).
Captures the conclusions of a state-of-the-art SDD benchmark so the context is not
lost between sessions.

## Guiding constraint

Keep the template **easy-to-use**: it must not feel bloated or over-opinionated.
Every candidate is judged on value vs. implementation complexity *and* on whether
it preserves that feel. Bias toward script-verifiable, low-concept additions that
deepen the skeleton's real differentiator — **explicit, scriptable traceability**.

## Benchmark sources (2026-06)

GitHub Spec Kit, AWS Kiro, BMAD-METHOD, Agent OS (Builder Methods), Gentleman
Programming (`gentle-pi` / `gentle-ai`, OpenSpec-based), and
`betta-tech/harness-sdd` (Kiro-style, multi-agent, EARS, human-approval gate).

Key finding: traceability is the practice the field implements mostly by LLM
prompt (Spec Kit `/analyze`, harness-sdd reviewer), not by deterministic script —
which is exactly where this skeleton leads.

## Done

- **spec-quality-gates** (Tier 1): EARS acceptance criteria with stable `AC<n>`
  ids, `[NEEDS CLARIFICATION]` markers + clarify gate, and a deterministic
  `coverage:specs` AC↔task↔verification gate wired into `/sdd-verify`.
  See `specs/features/spec-quality-gates/`.
- Removed the Cursor adapter; skills live in `.agents/skills` (official Codex
  discovery path); `AGENTS.md` is the single source of operating rules.
- Removed the bundled MCP context server — the skeleton runs purely on the
  agents' native mechanisms (skills, commands, `AGENTS.md`).
- **agent-adapter-projection**: single canonical source (`sdd/`) projected into
  per-agent adapters; added **opencode** support; the installer is agent-selective
  (`--agents`), so targets are not overloaded. Generated adapters are git-ignored
  and rebuilt via `adapters:build`/`prepare`. See
  `specs/features/agent-adapter-projection/`.

## Tier 2 — candidates (medium value / medium effort)

Suggested order. None started.

1. **Independent review in `/sdd-verify`** *(best value/effort; recommended next)*
   — a subagent reviews the diff against the acceptance criteria with a fresh
   context (à la gentle-pi "judgment-day" / Spec Kit fresh-context). Cheap with
   Claude subagents. Keep it **optional**. Reinforces the "verifiable" line.
2. **`docs/principles.md` — minimal constitution** — non-negotiable engineering
   principles, separated from the *workflow* rules that already live in
   `AGENTS.md`, checked as a gate in plan/implement (Spec Kit constitution / Kiro
   steering / Agent OS standards). **Keep it short** to avoid over-opinion. Do
   this only if `AGENTS.md` starts mixing process rules with engineering
   principles too much.
3. **Optional `design.md` for non-trivial features** — architecture / data model /
   contracts when it adds value (Kiro design / Spec Kit data-model+contracts).
   Strictly **opt-in** so simple features stay light.
4. **Bug-fix workflow `/sdd-fix`** (report → analyze → fix → verify) — covers the
   non-feature case that does not exist today (Kiro bug specs / Pimzino). Adds
   surface area; gauge real demand first.

## Tier 3 — deliberately rejected (would break easy-to-use)

- Multi-role agent teams (BMAD analyst/PM/architect/SM/dev/QA, "Party Mode").
- Document sharding of large specs (BMAD).
- Event-driven hooks / IDE automation (Kiro) — too tool-specific and opinionated.
- Custom persistent memory / Engram (gentle-ai) — Claude Code has native memory.
- Per-phase model routing, personas, banners (gentle-ai) — pure overhead.
- `[P]` parallel-task markers + dependency graph (Spec Kit/Kiro) — low value at
  small scale, adds notation.

## Refinements / follow-ups

Small improvements to already-delivered features (not full Tier-2 items):

- **spec-quality-gates — marker detection vs. backticks.** A live
  `[NEEDS CLARIFICATION]` marker that contains inline code (backticks) is mangled:
  `stripCode` runs first and consumes part of the marker, so it is not reported.
  Surfaced while dogfooding `agent-adapter-projection`. Fix options: state in the
  convention that a live marker must not contain backticks, and/or make the
  detector tolerant of inline code *inside* an otherwise-live marker. Low effort.
- **spec-quality-gates — optional `--strict` for `validate:specs`.** Let
  `validate:specs` fail (not just warn) on unresolved markers behind a flag, so the
  `/sdd-verify` block can be enforced by script instead of command-level discretion.

## Hardening backlog (repo audit 2026-06)

Senior-engineer audit of the whole repo. Grouped by tier; severity in brackets.
Ordered by value × effort, filtered to preserve "easy-to-use". Tier A is next.

### Tier A — Fresh-install correctness (high value, low effort) — NEXT
A default install (no `--with-examples`) ships a target whose own verification
commands are red until the user hand-creates a feature. Verified empirically.
- **A1 [high]** `validate:specs` / `coverage:specs` / `map:specs` exit 1 on zero
  features. Treat "0 features" as a **pass + notice** (exit 0). Consistent with the
  existing backward-compatible-gate principle ("no AC ids = no-op pass").
- **A2 [high]** `npm test` exits 1 with no test files → set
  `test: { passWithNoTests: true }` in `vitest.config.ts`.
- ~~**A3** `typecheck` errors on a fresh target~~ — **REJECTED**: verified `tsc
  --noEmit` exits 0 in a fresh install (`vitest.config.ts` is a valid input; tsc
  tolerates the empty `src`/`tests`/`examples` globs). Not a bug.
- **A4 [med]** target gets **no `.gitignore`** (would commit `node_modules/`).
  NOT a plain copy: **merge** — append only missing lines, idempotent (like
  `mergePackageJson`); never overwrite an existing `.gitignore`. Consumer ignore
  set: `node_modules/`, `dist/`, `coverage/`, `*.log`, `.DS_Store` (NOT the
  generated-adapter rules — targets commit their adapters).
- **A5 [low]** installer doesn't create `specs/features/` → scaffold a `.gitkeep`.

### Tier B — Installer safety on existing projects (high value)
- **B1 [high]** `cpSync(errorOnExist:!force)` aborts mid-install on the first
  pre-existing file → partial install. Make `copy` skip-and-warn per entry
  (consistent with adapter projection + package.json merge).
- **B2 [med]** unknown `--agents` validated only after agnostic assets copied →
  partial install on typo. Validate agents **before** any copy.
- **B3 [med]** no empty/conflict pre-scan of `--target`. Report collisions up
  front before writing.

### Tier C — Cross-platform & parser robustness (medium)
- **C1 [high]** frontmatter parser breaks on CRLF/BOM (Windows / `autocrlf`):
  `description` dropped, raw `---` leaks into every projected adapter. Normalize
  `\r\n`/BOM before matching.
- **C2 [low]** POSIX-only path handling (`split("/").pop()`, hardcoded `/`) in the
  three spec scripts → use `path.basename`/`path.join`.
- **C3 [med]** `map-spec-to-code` treats any backticked `src/|tests/|specs/` path
  anywhere in the doc as a hard traceability link → hypothetical mentions break the
  build. Scope extraction to the Traceability section.
- **C4 [med]** `validate-spec-structure` requires an exact H2 title → e.g.
  `## Non-Goals (out of scope)` fails. Allow trailing text after the canonical title.
- (see also: spec-quality-gates marker/backticks under Refinements above.)

### Tier D — Release-manager scripts (medium) — VALIDATION PENDING
Findings from static read; **confirm by running the release flow in a sandbox**
before fixing:
- `bump-version.mjs` throws on pre-release/build-metadata or missing `version`.
- `generate-changelog.mjs`: truncates commit subjects containing a tab; uses the
  newest **global** tag instead of the nearest ancestor (`git describe`); buckets
  `build`/`ci`/`revert` into "other"; no BREAKING-CHANGE section.
- `create-release.sh`: pushes before the GitHub-release step with no rollback;
  partial state if a generator fails after `bump` already wrote files; no
  `[[ -f "$NOTES_FILE" ]]` check.

### Tier E — Process / distribution (high strategic value)
- **E1 [high]** no CI (`.github/workflows`): the traceability differentiator is
  enforced only by the manual checklist. Add a workflow (lint+typecheck+test+
  validate+map+coverage) and optionally project one into targets.
- **E2 [med]** no `engines` field though the code needs Node ≥17 (`readline/
  promises`) / ≥16.7 (`cpSync`); `.nvmrc` (22) isn't shipped. Declare `engines.node`
  + ship `.nvmrc`.
- **E3 [med]** `prepare` hard-fails `npm install`/`npm ci` if `sdd/` is absent →
  guard with `existsSync('sdd')` no-op.

### Tier F — Root cause: test coverage
The four CLI drivers, `validate-spec-structure`, `map-spec-to-code`, and all three
release scripts have **no tests**. Most Tier C/D bugs (CRLF, tab, cpSync abort,
semver) would have been caught by targeted tests. Worth doing in parallel with the
fixes.

### Deliberately not doing
Cosmetics (40-char label collisions, UTC changelog date, `packageManager` field)
and pulling in a heavy markdown parser — low ROI or against simplicity.

## Notes

- This file is intentionally **not** in `skeleton.manifest.json`: it documents the
  development of the skeleton, not something adopters need.
