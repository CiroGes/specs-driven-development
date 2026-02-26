# Acceptance: hello-world

## Criteria to Test Mapping

1. Response has `status: "ok"`
- Covered by: `tests/integration/hello-world.controller.test.ts`

2. Greeting format is `Hello, <name>!`
- Covered by: `tests/unit/hello-world.service.test.ts`
- Covered by: `tests/integration/hello-world.controller.test.ts`

3. Missing or empty name defaults to `World`
- Covered by: `tests/unit/hello-world.service.test.ts`
- Covered by: `tests/integration/hello-world.controller.test.ts`

## Manual Verification
- Run `npm run hello` to print a sample greeting flow.
