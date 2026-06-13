# Feature: <feature-name>

## Context

## Problem

## Goals

## Non-Goals

## Scenarios

## Acceptance Criteria

<!--
Write each criterion in EARS, with a stable id (AC1, AC2, ...), exactly one
observable behavior, and the keyword SHALL / SHALL NOT. Given/When/Then is an
accepted alternative form. Avoid soft verbs (should / could / supports) and
compound criteria (more than one SHALL in a single item).

If an input is missing, insert a [NEEDS CLARIFICATION: <question>] marker in plain
prose instead of inventing the answer — do NOT wrap a live marker in backticks.

EARS patterns:
- Ubiquitous:  The system SHALL <response>.
- Event:       WHEN <trigger>, the system SHALL <response>.
- Unwanted:    IF <unwanted condition> THEN the system SHALL <response>.

`coverage:specs` checks that every AC<n> here is referenced by a task and has a
verification row in acceptance.md. See docs/spec-authoring.md for the full guide.
-->

- **AC1** — The system SHALL <observable behavior>.
- **AC2** — WHEN <trigger>, the system SHALL <observable behavior>.

## Traceability
- Spec tasks: `specs/features/<feature-name>/tasks.md`
- Implementation: `src/features/<feature-name>/...`
- Tests: `tests/...`
