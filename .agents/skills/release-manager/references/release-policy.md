# Release Policy

## Versioning

- Use semantic versioning: `MAJOR.MINOR.PATCH`.
- Tag format must be `vX.Y.Z`.

## Conventional Commit mapping

- `feat` -> MINOR bump
- `fix`, `perf` -> PATCH bump
- `!` or `BREAKING CHANGE` -> MAJOR bump
- `docs`, `refactor`, `test`, `chore`, `build`, `ci` -> no automatic bump by default

## Preconditions

- Branch is `main` unless explicitly overridden.
- Working tree must be clean before release.
- Target tag must not already exist.

## Release artifacts

- `package.json` (and `package-lock.json` when present)
- `CHANGELOG.md`
- Annotated tag `vX.Y.Z`
