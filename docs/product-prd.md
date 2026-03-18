# Product PRD: Specs-Driven Development Skeleton

## 1. Document Control
- Owner: Repository maintainers
- Stakeholders: Developers using Cursor/Codex workflows
- Status: Active
- Last updated: 2026-02-26

## 2. Product Vision
### Problem statement
Teams using LLM agents often lose consistency between sessions and contributors, causing rework, ambiguous implementation decisions, and weak traceability.

### Why now
AI-assisted development is already part of daily engineering work. A lightweight but versioned context architecture is needed to keep outputs consistent and auditable.

### Business objective
Provide a practical starter repository that standardizes SDD execution with reusable rules, commands, and skills.

## 3. Users and Segments
### Primary users
- Solo developers adopting SDD with AI assistance
- Small teams that need repeatable coding workflows

### Pain points
- Session memory loss and inconsistent agent behavior
- Missing alignment between specs, code, and tests
- Unclear process ownership across delivery stages

### Jobs to be done
- Define product scope before opening feature-level work.
- Start a new feature with structure and constraints
- Move from spec to implementation with clear handoffs
- Validate and release work with predictable standards

## 4. Goals and Success Metrics
### Goals
- Standardize a complete SDD lifecycle (init -> spec -> plan -> implement -> verify -> retro).
- Keep feature traceability explicit from specs to code and tests.
- Enforce stable commit/release conventions.

### Success metrics
- 100% of new features use `specs/features/<feature>/` as entrypoint.
- 100% of merged features include unit and integration tests.
- 100% of delivery branches pass `test`, `typecheck`, `lint`, `validate:specs`, and `map:specs`.
- Release process produces version, tag, and changelog consistently.

## 5. Scope
### In scope
- Node.js ESM project skeleton (TS/JS hybrid)
- Cursor rules and commands for SDD
- Codex-style skills for spec authoring, implementation, and releases
- Traceability scripts and quality checks

### Out of scope
- Production backend framework and infrastructure scaffolding
- UI product implementation
- CI/CD pipelines with hosted runners (can be added later)

## 6. Requirements
### Functional requirements
- Must make `docs/product-prd.md` the first artifact to define when starting a new project.
- Must support feature-first specs under `specs/features/`.
- Must define operational rules under `.cursor/rules/`.
- Must define command workflows under `.cursor/commands/`.
- Must provide at least one end-to-end example feature.
- Must namespace skeleton-owned npm scripts when they represent optional subsystems such as MCP servers, to avoid collisions with project-specific tooling.
- Must support conventional commits and release automation.

### Non-functional requirements
- Developer experience: simple local setup with npm scripts.
- Maintainability: clear file structure and low cognitive overhead.
- Reliability: deterministic checks for structure and traceability.
- Interoperability: skeleton defaults must coexist with project-specific MCP servers and automation without forcing script renames.
- Auditability: changes and process decisions tracked in git.

## 7. Constraints and Assumptions
### Technical constraints
- Runtime: Node.js
- Module format: ESM
- Language mode: TS/JS hybrid

### Process constraints
- Git is the source of truth for all changes.
- Rules and commands must remain readable and maintainable.

### Assumptions
- Contributors use Cursor/Codex-like agent workflows.
- Team accepts docs-first planning before implementation.

## 8. UX / User Flows
### Primary flow
1. Define or update the product PRD in `docs/product-prd.md`.
2. Initialize feature docs with `sdd-init`.
3. Refine specification with `sdd-spec-create`.
4. Build executable plan with `sdd-plan`.
5. Implement code/tests with `sdd-implement`.
6. Validate with `sdd-verify`.
7. Capture improvements with `sdd-retro`.

### Edge flow
- If spec is ambiguous, planning must block implementation until clarified.
- If verification fails, implementation iterates before merge.

## 9. Risks and Mitigations
- Risk: commands overreach scope and implement too early.
  - Mitigation: strict scope boundaries in command definitions.
- Risk: traceability drift over time.
  - Mitigation: mandatory `validate:specs` and `map:specs` checks.
- Risk: inconsistent release artifacts.
  - Mitigation: `release-manager` skill and scripted release workflow.
- Risk: generic skeleton script names collide with project-specific tooling.
  - Mitigation: namespace subsystem scripts such as `mcp:sdd-context:*` and keep `.cursor/mcp.json` wired directly to the server command.

## 10. Rollout Plan
- Milestone 1: skeleton and baseline workflow (completed).
- Milestone 2: feature lifecycle proven with `random-integer-calculator` (completed).
- Milestone 3: release automation and `v0.1.0` publication (completed).
- Milestone 4: add global PRD and reusable PRD template (current).

## 11. Open Questions
- Should PRD compliance checks be automated in scripts?
- Should release workflow be wired into CI later?
- Should a dedicated skill handle KPI tracking for process quality?

## 12. Traceability
- Rules: `.cursor/rules/`
- Commands: `.cursor/commands/`
- Skills: `.codex/skills/`
- Specs: `specs/features/`
- Example features:
  - `examples/sdd-demo/specs/features/hello-world/`
  - `examples/sdd-demo/specs/features/random-integer-calculator/`
- Storytelling: `examples/sdd-demo/docs/sdd-storytelling-random-integer-calculator.md`
