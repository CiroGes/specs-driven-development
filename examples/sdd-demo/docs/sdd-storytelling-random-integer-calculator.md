# Storytelling: Flujo SDD real (random-integer-calculator)

## Resumen

Este documento cuenta, en orden cronológico, cómo se ejecutó el flujo de trabajo de este proyecto con enfoque specs-driven development (SDD), usando los comandos SDD y cerrando cada etapa con commits explícitos.

Feature de referencia: `random-integer-calculator`.

## Timeline por commits

1. `ad34dfe` — `chore(init): bootstrap specs-driven development skeleton`
- Se creó el skeleton base del proyecto.
- Se agregaron reglas de agente (`AGENTS.md`), comandos SDD, skills, estructura de specs, código hello-world, tests, scripts de validación y configuración Node/TS/JS.

2. `d4a22ca` — `chore(cursor): harden sdd command scope boundaries`
- Se reforzó el alcance de comandos para evitar sobre-ejecución:
  - `sdd-init`, `sdd-spec-create`, `sdd-plan` quedaron en modo documentación/planificación.
  - `sdd-implement` quedó como único comando habilitado para tocar `src/` y `tests/`.

3. `a576268` — `docs(specs): initialize random-integer-calculator feature docs`
- Resultado de `sdd-init` sobre la nueva feature.
- Se crearon documentos iniciales:
  - `specs/features/random-integer-calculator/feature.spec.md`
  - `specs/features/random-integer-calculator/tasks.md`
  - `specs/features/random-integer-calculator/acceptance.md`

4. `418b7aa` — `docs(specs): refine random-integer-calculator acceptance and scope`
- Resultado de `sdd-spec-create`.
- Se refinó la spec para cerrar ambiguedades:
  - rango exacto de enteros (`2..200`)
  - formato exacto de salida (`<a> + <b> = <c>`)
  - trazabilidad más concreta.

5. `90b46aa` — `docs(specs): expand random-integer-calculator implementation plan`
- Resultado de `sdd-plan`.
- Se detalló `tasks.md` con orden, dependencias, riesgos y entregables por tarea.
- Se añadieron planning notes en `feature.spec.md`.

6. `34a3e8e` — `docs(readme): clarify sdd-implement invocation with inputs`
- Mejora documental del proceso.
- Se aclaró en README que `sdd-implement` debe ejecutarse con inputs explícitos (feature + rutas de spec/tasks).

7. `9b7c943` — `feat(random-integer-calculator): implement random sum feature and tests`
- Resultado de `sdd-implement`.
- Se implementó la feature completa:
  - código en `src/features/random-integer-calculator/`
  - tests unitarios e integración
  - actualizaciones de trazabilidad en specs
  - script de ejecución manual `random-calc` en `package.json`.

8. `6d40c1c` — `chore(sdd): apply retro improvements to planning templates`
- Resultado de `sdd-retro`.
- Se registró la retrospectiva en:
  - `specs/features/random-integer-calculator/retro.md`
- Se mejoró el proceso:
  - convención nueva en `.claude/commands/sdd-plan.md`
  - ajuste del template `specs/templates/tasks.template.md`
  - enfoque: si acceptance requiere verificación manual CLI, agregar o reutilizar script de proyecto y documentarlo en `acceptance.md`.

## Paso importante sin commit

`sdd-verify` se ejecutó y reportó checks en verde sin modificar archivos, por eso no aparece como commit propio.

## Qué hizo el agente en cada fase del flujo

1. Init
- Levantó documentación mínima de la feature para arrancar sin código.

2. Spec Create
- Convirtió borradores en criterios de aceptación concretos y testeables.

3. Plan
- Tradujo la spec a tareas ejecutables, con orden y riesgos explícitos.

4. Implement
- Implementó únicamente lo planificado y alineado a la spec.

5. Verify
- Validó calidad técnica y trazabilidad sin introducir cambios.

6. Retro
- Capturó fricciones reales y convirtió ese aprendizaje en mejoras del propio framework de trabajo (comandos + templates).

## Resultado final

- La feature `random-integer-calculator` quedó integrada y validada.
- El proceso SDD del repo quedó más robusto que al inicio, especialmente en:
  - control de alcance por comando
  - claridad de inputs para implementación
  - planificación de verificación manual en casos CLI.
