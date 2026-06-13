# Feature: random-integer-calculator

## Context
Demo práctica del flujo SDD completo con una feature simple de consola. El proyecto usa Node.js ESM, código híbrido TypeScript/JavaScript y estructura feature-first; las features se especifican en `specs/features/<feature>/`, se implementan en `src/features/<feature>/` y se validan en `tests/`, con traceabilidad explícita.

## Problem
Se necesita una feature mínima que genere dos enteros aleatorios, los sume y muestre en una sola línea los operandos y el resultado, para ejercitar el ciclo spec → implementación → tests.

## Goals
- Generar dos enteros aleatorios en el rango **2..200** (inclusive).
- Calcular la suma de ambos.
- Imprimir una sola línea con formato exacto: **`<a> + <b> = <c>`** (donde `a` y `b` son los operandos y `c` la suma).
- Mantener estructura feature-first y traceabilidad specs → src → tests.

## Non-Goals
- Entrada por usuario (input interactivo o argumentos).
- Persistencia, base de datos o APIs externas.
- API HTTP o servidor web.
- Operaciones distintas a la suma (resta, producto, etc.).

## Scenarios
1. Al invocar la feature, se generan dos enteros en el rango 2..200 y se calcula su suma.
2. La salida es exactamente una línea con formato `<a> + <b> = <c>`.
3. Los números generados son siempre válidos dentro del rango definido (2..200).

## Acceptance Criteria
- **AC1** — The system SHALL generate two integers `a` and `b`, each in the inclusive range 2–200.
- **AC2** — The system SHALL compute `c` as the sum of `a` and `b`.
- **AC3** — WHEN the feature is invoked, the system SHALL output exactly one line formatted as `<a> + <b> = <c>`.
- **AC4** — The feature SHALL keep traceability from spec to tasks, implementation, and tests.

## Traceability
- Spec tasks: `specs/features/random-integer-calculator/tasks.md`
- Acceptance checks: `specs/features/random-integer-calculator/acceptance.md`
- Implementation entrypoint: `src/features/random-integer-calculator/index.ts`
- Service logic: `src/features/random-integer-calculator/random-integer-calculator.service.ts`
- Controller (formato salida): `src/features/random-integer-calculator/random-integer-calculator.controller.js`
- Unit tests: `tests/unit/random-integer-calculator.service.test.ts`
- Integration tests: `tests/integration/random-integer-calculator.controller.test.ts`

## Planning notes (sdd-plan)
- Orden de implementación: servicio TS (generación + suma) → controller/adapter (formato una línea) → index.ts → tests unitarios → tests integración → traceability.
- Riesgo: aleatoriedad en tests; validar rango y formato en múltiples runs o parseando la línea en integración.
- Contrato salida: spec pide "imprimir" una línea; decidir en implementación si `console.log` en adapter/entrypoint o retorno de string.
