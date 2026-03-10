# Acceptance: random-integer-calculator

## Criteria to Test Mapping

1. Se generan dos enteros válidos en el rango definido (2..200)
- Covered by: `tests/unit/random-integer-calculator.service.test.ts` (getTwoRandomOperands, computeRandomSum)

2. La suma es correcta
- Covered by: `tests/unit/random-integer-calculator.service.test.ts` (add, computeRandomSum)

3. La salida es una sola línea con el formato exacto `<a> + <b> = <c>`
- Covered by: `tests/integration/random-integer-calculator.controller.test.ts` (runRandomIntegerCalculatorFeature)

4. Hay traceability a src y tests
- Covered by: `specs/features/random-integer-calculator/feature.spec.md` (sección Traceability), `tasks.md`; implementación en `src/features/random-integer-calculator/`, tests en `tests/unit/` y `tests/integration/`

## Manual Verification
- Ejecutar: `npm run random-calc`  
- Comprobar que la salida es exactamente una línea con formato `<a> + <b> = <c>` y que los valores están en 2..200.
