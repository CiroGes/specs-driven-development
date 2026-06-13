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

## Notes

- This file is intentionally **not** in `skeleton.manifest.json`: it documents the
  development of the skeleton, not something adopters need.
