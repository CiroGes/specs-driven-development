# Acceptance: agent-adapter-projection

AC→verification map consumed by `coverage:specs`. `auto` = automated test;
`script` = observable script run; `inspect` = documented review.

| AC | Verification | Test / check (planned) |
|----|--------------|------------------------|
| AC1 | inspect | canonical `sdd/` holds single-copy commands + skills; no committed `.claude`/`.agents` duplicates |
| AC2 | inspect + auto | projection manifest exists; projector test asserts manifest-driven mapping |
| AC3 | auto | `tests/unit/build-agent-adapters.test.ts` (body copied + frontmatter applied + placeholders rewritten) |
| AC4 | inspect | `.gitignore` covers generated adapter dirs and `CLAUDE.md` |
| AC5 | script | `npm run adapters:build` generates all agents' adapters locally |
| AC6 | inspect | clone obtains adapters without manual build (per resolved prepare/step decision) |
| AC7 | auto | projector/installer test: `--agents claude,opencode` writes only those |
| AC8 | inspect | installer prompts for agents on a TTY when `--agents` is absent |
| AC9 | auto | installer test: unselected agent's files are not written |
| AC10 | auto | installer test: agent-agnostic assets installed regardless of selection |
| AC11 | auto | projector test: supported agents include claude, codex, opencode |
| AC12 | auto | projector test: opencode → `.opencode/command/*.md` + skills in `.agents/skills/` |
| AC13 | auto | projector test: claude → `.claude/commands`, `.claude/skills`, `CLAUDE.md` |
| AC14 | auto | projector test: codex → `.agents/skills/<name>/agents/openai.yaml` present |
| AC15 | auto | projector test: two runs produce identical output (deterministic) |
| AC16 | auto | `tests/unit/build-agent-adapters.test.ts` exists and covers the above |

## Manual verification commands (planned)

```bash
npm run adapters:build                                   # all agents (local dev)
npm run install:skeleton -- --agents opencode --target /tmp/probe   # selective
```

## Notes

- `inspect` criteria are structural/doc changes verified by review during
  `/sdd-verify` and code review; behavioral criteria are automated.
- Several criteria may share `tests/unit/build-agent-adapters.test.ts` plus an
  installer-focused test; final names reconciled in the closeout task.
