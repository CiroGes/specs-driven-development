# Acceptance: hello-world

## Criteria to Test Mapping

| AC | Verification | Test / check |
|----|--------------|--------------|
| AC1 | auto | `tests/integration/hello-world.controller.test.ts` (status `ok`) |
| AC2 | auto | `tests/unit/hello-world.service.test.ts`, `tests/integration/hello-world.controller.test.ts` (format `Hello, <name>!`) |
| AC3 | auto | `tests/unit/hello-world.service.test.ts`, `tests/integration/hello-world.controller.test.ts` (defaults to `World`) |
| AC4 | auto | `tests/unit/hello-world.service.test.ts` (trims surrounding spaces) |

## Manual Verification
- Run `npm run hello` to print a sample greeting flow.
