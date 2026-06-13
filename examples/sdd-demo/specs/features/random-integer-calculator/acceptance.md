# Acceptance: random-integer-calculator

## Criteria to Test Mapping

| AC | Verification | Test / check |
|----|--------------|--------------|
| AC1 | auto | `tests/unit/random-integer-calculator.service.test.ts` (operands in 2..200) |
| AC2 | auto | `tests/unit/random-integer-calculator.service.test.ts` (add / computeRandomSum) |
| AC3 | auto | `tests/integration/random-integer-calculator.controller.test.ts` (one-line `<a> + <b> = <c>`) |
| AC4 | inspect | feature.spec.md Traceability section + tasks.md → src/ and tests/ paths |

## Manual Verification
- Ejecutar: `npm run random-calc`  
- Comprobar que la salida es exactamente una línea con formato `<a> + <b> = <c>` y que los valores están en 2..200.
