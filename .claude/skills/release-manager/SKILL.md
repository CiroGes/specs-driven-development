---
name: release-manager
description: Automate changelog generation, semantic version bumping, git tagging, and GitHub release publication for this repository using conventional commits.
---

# Release Manager

Use this skill when the user asks to publish a release, create a changelog entry, bump version, or tag a version.

## Required inputs

- Target version (`vX.Y.Z`) or bump type (`major|minor|patch`)
- Target branch (default: `main`)
- Release notes mode (`auto` or `manual`)

## Workflow

1. Validate preconditions:
- Clean working tree
- Correct branch
- Target tag does not already exist
2. Bump version using `scripts/bump-version.mjs`.
3. Generate `CHANGELOG.md` entry using `scripts/generate-changelog.mjs`.
4. Commit release artifacts.
5. Create annotated git tag.
6. Push commit and tag.
7. Publish GitHub release using `scripts/create-release.sh` (uses `gh` when available).

## Scripts

- `.claude/skills/release-manager/scripts/bump-version.mjs`
- `.claude/skills/release-manager/scripts/generate-changelog.mjs`
- `.claude/skills/release-manager/scripts/create-release.sh`

## Quick start

```bash
.claude/skills/release-manager/scripts/create-release.sh --version v0.1.0 --branch main --notes auto
```

## References

- `references/release-policy.md`
