# Feature: random-integer-calculator

## Context
El proyecto usa Node.js ESM con código híbrido TypeScript/JavaScript y estructura feature-first. Las features se especifican primero en `specs/features/<feature>/` y se implementan en `src/features/<feature>/` con tests en `tests/`, manteniendo traceabilidad explícita.

## Problem
Se necesita una feature mínima que genere dos enteros aleatorios, los sume y muestre en una sola línea los dos operandos y el resultado.

## Goals
- Generar dos enteros aleatorios (origen/rango definido en la spec o por defecto razonable).
- Calcular la suma de ambos.
- Exponer un resultado en una sola línea con formato: operandos y resultado (ej. `a + b = suma` o equivalente).
- Mantener estructura feature-first y traceabilidad specs → src → tests.

## Non-Goals
- Interfaz gráfica, CLI interactiva o servidor HTTP.
- Persistencia, base de datos o APIs externas.
- Soporte para otros operadores (resta, producto, etc.) en esta versión inicial.

## Scenarios
1. Al invocar la feature, se generan dos enteros aleatorios y se calcula su suma.
2. La salida (o el valor retornado) contiene en una sola línea los dos operandos y el resultado.
3. Los números generados están dentro del rango acordado (p. ej. enteros no negativos o un intervalo cerrado).

## Acceptance Criteria
- La feature genera exactamente dos enteros aleatorios por ejecución.
- La suma de ambos se calcula correctamente.
- La salida (stdout o valor retornado) muestra en una sola línea los dos operandos y el resultado, en formato definido (ej. `X + Y = Z`).
- Rango de enteros documentado (p. ej. 0–99 o 1–100) y respetado por la implementación.
- Tests unitarios cubren la lógica de generación/suma; tests de integración o de feature validan la línea de salida.

## Traceability
- Spec tasks: `specs/features/random-integer-calculator/tasks.md`
- Acceptance checks: `specs/features/random-integer-calculator/acceptance.md`
- Implementation: `src/features/random-integer-calculator/...` (placeholder)
- Tests: `tests/...` (placeholder)
