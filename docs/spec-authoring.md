# Spec Authoring Guide (EARS, Clarification Markers, Coverage)

This guide explains how to write acceptance criteria in this skeleton so they are
unambiguous, individually testable, and machine-checkable. It backs the
`spec-quality-gates` feature.

## 1. Acceptance criteria in EARS

Write each criterion using **EARS** (Easy Approach to Requirements Syntax). Three
rules, kept intentionally light:

1. **Stable id** — prefix each criterion with `AC<n>` (`AC1`, `AC2`, …). Ids are
   the anchor that tasks and tests reference.
2. **One behavior** — exactly one observable behavior per criterion. If you wrote
   two `SHALL`s, split into two criteria.
3. **SHALL / SHALL NOT** — use the keyword. Avoid soft verbs ("should", "could",
   "supports", "handles nicely").

### Patterns

| Pattern | Form | Use for |
|---------|------|---------|
| Ubiquitous | `The system SHALL <response>.` | Always-true behavior |
| Event | `WHEN <trigger>, the system SHALL <response>.` | Reaction to an event |
| Unwanted | `IF <unwanted condition> THEN the system SHALL <response>.` | Errors / edge cases |
| State | `WHILE <state>, the system SHALL <response>.` | Behavior during a state |
| Optional | `WHERE <optional feature>, the system SHALL <response>.` | Conditional behavior |

You only need Ubiquitous / Event / Unwanted for most features.

**Given/When/Then is an accepted alternative** for an individual criterion when it
reads more naturally — keep the stable id and the one-behavior rule.

### Example

Free-form (avoid):

> The result should be shown clearly with the sum.

EARS (prefer):

> - **AC1** — The system SHALL generate two integers `a` and `b`, each in the
>   inclusive range 2–200.
> - **AC2** — WHEN the feature is invoked, the system SHALL print exactly one line
>   formatted as `<a> + <b> = <c>` where `c = a + b`.

## 2. Clarification markers

When the inputs do not give you a fact you need, **do not invent it**. Insert a
marker in plain prose:

```
The range is 2–200 [NEEDS CLARIFICATION: is it inclusive on both ends?]
```

- `/sdd-spec-create` lists every open marker at the end of its run so a human can
  resolve them.
- `validate:specs` reports unresolved markers as a **non-blocking warning**.
- `/sdd-verify` treats unresolved markers as a **failure** — they must be resolved
  before implementation.

> Write a *live* marker as plain prose. When you merely mention the token in
> documentation, wrap it in `inline code` or a fenced block so the detector skips
> it. (The detector strips code spans and fenced blocks before scanning.)

## 3. Coverage check

`coverage:specs` proves the artifacts agree:

- Every `AC<n>` in `feature.spec.md` must be referenced by at least one task in
  `tasks.md` **and** have at least one verification row in `acceptance.md`.
- An AC missing either is reported **uncovered** and fails the check (non-zero
  exit).
- A task referencing no `AC<n>` is reported as an **orphan warning** (legitimate
  chores need no AC).

"Verification" in `acceptance.md` may be `auto` (automated test), `script`
(observable script run), or `inspect` (documented manual review) — the check
trusts the declared map; `npm test` enforces that automated tests actually pass.

## 4. The machine-readable contract

Tooling depends on this exact format:

- **AC ids:** list items starting with bold `**AC<n>**` under `## Acceptance Criteria`.
- **Task refs:** any `AC<n>` tokens on a task line in `tasks.md`.
- **Verification map:** a markdown table in `acceptance.md` whose first column is `AC`.
