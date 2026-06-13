---
description: Draft a Conventional Commits message (feat|fix|docs|refactor|test|chore|build|ci|perf, optional scope, optional breaking change marker) for currently staged changes, with a short justification of the chosen type/scope and a fallback alternative. Use when the user is about to commit and wants a properly formatted, repo-conformant message.
---

# SDD Commit (Conventional Commits)

## Inputs

- Commit purpose (what changed and why)
- Commit type (`feat|fix|docs|refactor|test|chore|build|ci|perf`)
- Optional scope (e.g. `init`, `specs`, `hello-world`, `release`)
- Breaking change? (`yes/no`)
- Optional body bullets
- Optional footer (`BREAKING CHANGE`, issue refs)

## Expected Output

- Proposed commit message in Conventional Commits format
- Short justification for selected `type` and `scope`
- Validation checklist before commit

## Done Criteria

- Message format is valid Conventional Commits
- Type/scope match the actual change
- Breaking change is explicitly marked when applicable
- Suggested message is ready to run with `git commit -m "<message>"`

## Workflow

1. Summarize staged changes.
2. Select the best commit `type`.
3. Select scope (or omit if not needed).
4. Draft header: `<type>(<scope>): <description>`.
5. Add optional body/footer if needed.
6. Return final message and one fallback alternative.

## Example (Initial Commit)

- `chore(init): bootstrap specs-driven development skeleton`
