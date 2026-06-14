# Tasks: install-idempotency

> Executable plan from `/sdd-plan`. Ordered, no hidden decisions. Each task lists
> files + the `AC<n>` it covers.

## Design decisions (explicit)

- **Skip-existing copy:** replace the `cpSync(..., { errorOnExist: !force })` path
  with a recursive walk that, per file, skips when the target exists and `--force`
  is off (recording it as "skipped"), otherwise writes (recording "added").
  Directories are always traversed (never skipped). `--force` overwrites.
- **Tracking:** a single `stats = { added: [], skipped: [] }` threaded through the
  copy of both the core `copy` list and `--with-examples`. The `generate` step
  (product-prd) keeps its existing skip-if-exists behavior.
- **Early validation:** validate `--agents` against the projection manifest right
  after `resolveAgents`, before any filesystem write; unknown → throw → exit 1.
- **Summary:** after install, log `added N, skipped M`; if `M > 0 && !force`, add
  "pass --force to overwrite".

## Ordered tasks

- [x] **T1** Add a recursive `copyInto(src, dest, force, stats, targetRoot)`
  helper in `install-sdd-skeleton.mjs` (traverse dirs; skip existing files when
  `!force`, recording added/skipped relative paths). (AC1, AC2)
- [x] **T2** Route `copyManifestEntry` (string + `{source,target}` forms) and the
  `--with-examples` copies through `copyInto`; drop the `errorOnExist` abort. (AC1, AC3)
- [x] **T3** Validate `--agents` against the manifest immediately after
  `resolveAgents`, before any write. (AC5)
- [x] **T4** Thread `stats` through `main`; print the added/skipped summary and the
  `--force` hint. (AC6, AC7)
- [x] **T5** Confirm idempotency: a second run with no `--force` performs no writes
  (skips everything). (AC4)
- [x] **T6** Extend `tests/unit/install-skeleton.test.ts`: install onto a populated
  target completes (no throw) and leaves a pre-existing `tsconfig.json` untouched;
  `--force` overwrites it; unknown `--agents` exits non-zero and writes nothing. (AC8)
- [x] **T7** Docs: README note on conservative-by-default install + `--force`; mark
  Tier B delivered in `docs/roadmap.md`. (AC3)
- [x] **T8** Reconcile `acceptance.md` with final test names. (AC8)

## Risks

- **R1** Recursive copy diverging from `cpSync` semantics (perms, symlinks).
  *Mitigation:* keep using `cpSync` for the actual single-file write (it preserves
  mode); only the traversal + existence check is custom.
- **R2** Skip-existing means the skeleton won't *update* shared files in an already
  installed project without `--force`. *Mitigation:* the summary states it
  explicitly ("M skipped; pass --force to overwrite").
- **R3** Unknown-agents validated early must still allow the agnostic-only case if
  later we add an `--agents none` — out of scope; current agents are non-empty.

## Dependencies

- T2 depends on T1; T4 on T1/T2 (stats); T5/T6 on T1-T4. T3 is independent.
- No dependency on `src/features/` runtime code.

## Manual verification

```bash
mkdir -p /tmp/proj && echo '{"compilerOptions":{}}' > /tmp/proj/tsconfig.json
node scripts/install-sdd-skeleton.mjs --target /tmp/proj --agents claude   # completes, skips tsconfig
node scripts/install-sdd-skeleton.mjs --target /tmp/proj --agents claude   # idempotent: added 0
node scripts/install-sdd-skeleton.mjs --target /tmp/proj --agents clade     # errors before writing
```
