# Feature: hello-world

## Context
This repository demonstrates a minimal specs-driven workflow with Node.js, ESM, and hybrid TS/JS.

## Problem
Teams need a concrete starter that enforces writing specs first, then implementation and tests with clear traceability.

## Goals
- Provide a minimal yet real feature that can be executed and tested.
- Demonstrate a TS service with a JS adapter.
- Keep spec-to-code-to-test links explicit.

## Non-Goals
- No HTTP server or framework integration.
- No database or external API.
- No CI or git hooks in this first version.

## Scenarios
1. When a valid name is provided, return a greeting using that normalized name.
2. When name is missing, return a greeting for `World`.
3. Surrounding spaces in input should be trimmed.

## Acceptance Criteria
- Feature entrypoint returns a response with `status: "ok"`.
- Message format is exactly `Hello, <name>!`.
- Empty or missing name yields `Hello, World!`.
- Unit and integration tests cover these rules.

## Traceability
- Spec tasks: `specs/features/hello-world/tasks.md`
- Acceptance checks: `specs/features/hello-world/acceptance.md`
- Implementation entrypoint: `src/features/hello-world/index.ts`
- Service logic: `src/features/hello-world/hello-world.service.ts`
- JS adapter: `src/features/hello-world/hello-world.controller.js`
- Unit tests: `tests/unit/hello-world.service.test.ts`
- Integration tests: `tests/integration/hello-world.controller.test.ts`
