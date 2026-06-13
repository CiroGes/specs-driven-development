# Acceptance: agent-adapter-projection

AC→verification map consumed by `coverage:specs`. `auto` = automated test;
`script` = observable script run; `inspect` = documented review.

| AC | Verification | Test / check |
|----|--------------|--------------|
| AC1 | inspect | canonical `sdd/` holds single-copy commands + skills; generated adapters git-ignored (not committed) |
| AC2 | inspect + auto | `sdd/agents.manifest.json` exists; `build-agent-adapters.test.ts` asserts manifest-driven mapping |
| AC3 | auto | `tests/unit/build-agent-adapters.test.ts` (frontmatter parsed/applied, body carried, command output) |
| AC4 | inspect | `.gitignore` covers `.claude/commands`, `.claude/skills`, `.agents/skills`, `.opencode/`, `CLAUDE.md` |
| AC5 | script | `npm run adapters:build` generates all agents' adapters locally |
| AC6 | inspect | `package.json` `prepare` runs `adapters:build` on `npm install` |
| AC7 | auto | `tests/unit/install-skeleton.test.ts` (`--agents claude` / `opencode` writes only those) |
| AC8 | inspect | `install-sdd-skeleton.mjs` `resolveAgents` prompts on a TTY when `--agents` is absent |
| AC9 | auto | `tests/unit/install-skeleton.test.ts` + `build-agent-adapters.test.ts` (unselected agent paths absent) |
| AC10 | auto | `tests/unit/install-skeleton.test.ts` (AGENTS.md, specs/templates, package.json always present) |
| AC11 | auto | `tests/unit/build-agent-adapters.test.ts` (claude/codex/opencode round-trip) |
| AC12 | auto | `tests/unit/build-agent-adapters.test.ts` (opencode → `.opencode/command` + skills in `.agents/skills`) |
| AC13 | auto | `tests/unit/build-agent-adapters.test.ts` (claude → `.claude/commands`, `.claude/skills`, `CLAUDE.md`) |
| AC14 | auto | `tests/unit/build-agent-adapters.test.ts` (codex → `.agents/skills/<name>/agents/openai.yaml`) |
| AC15 | auto | `tests/unit/build-agent-adapters.test.ts` (two `buildPlan` runs identical, sorted) |
| AC16 | auto | `tests/unit/build-agent-adapters.test.ts` (9 cases) + `install-skeleton.test.ts` (2 cases) |

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
