# Acceptance: random-integer-calculator

## Criteria to Test Mapping

1. Se generan dos enteros válidos en el rango definido (2..200)
- Covered by: unit tests (lógica de generación en rango)
- Placeholder: `tests/unit/random-integer-calculator.service.test.ts` (o equivalente)

2. La suma es correcta
- Covered by: unit tests (lógica de suma)
- Placeholder: mismo archivo de tests unitarios

3. La salida es una sola línea con el formato exacto `<a> + <b> = <c>`
- Covered by: integration/feature tests (salida de la feature)
- Placeholder: `tests/integration/random-integer-calculator.test.ts` (o equivalente)

4. Hay traceability a src y tests
- Covered by: esta spec, `tasks.md` y enlaces en acceptance; implementación en `src/features/random-integer-calculator/`, tests en `tests/`

## Manual Verification
- Ejecutar el entrypoint de la feature y comprobar que la salida es exactamente una línea con formato `<a> + <b> = <c>` y que los valores están en 2..200.
- (Tras implementación: documentar comando exacto, p. ej. `npm run random-calc` o ruta del script.)
