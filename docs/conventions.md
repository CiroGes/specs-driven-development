# Conventions

- Folder naming: kebab-case for features.
- File naming: `<feature>.<layer>.<ext>` where useful.
- Specs are mandatory before implementation.
- Acceptance criteria use EARS with stable `AC<n>` ids; each must be referenced by
  a task and have a verification entry (`auto` / `script` / `inspect`) in
  `acceptance.md`. See [spec-authoring.md](spec-authoring.md).
- Prefer TypeScript for contracts and logic, JavaScript for explicit adapters only.

## SDD tooling scripts

- Keep parsing/logic in `scripts/lib/*.mjs` pure functions with unit tests; the
  executable script is a thin I/O + exit-code wrapper. Stay dependency-free.
- New spec gates must be backward-compatible: content that has not opted into a
  convention passes as a no-op, so adopting the skeleton or rolling out a gate
  never breaks existing specs.
