# Retro: random-integer-calculator

## Qué funcionó bien del flujo SDD

- **Cadena de comandos clara:** init → spec-create → plan → implement → verify dio un flujo predecible y con scope acotado en cada paso.
- **Spec antes de código:** Tener Goals, Non-Goals y criterios de aceptación testables evitó scope creep (ej. no se añadieron más operadores ni API HTTP).
- **Tasks con rutas explícitas:** Que cada tarea en `tasks.md` indicara archivos concretos (`src/...`, `tests/...`) permitió implementar sin decisiones ocultas y alinear con hello-world (service TS, controller JS, index).
- **Traceability al final:** Actualizar feature.spec.md y acceptance.md en T7 con rutas definitivas dejó el mapeo spec → src → tests comprobable (validate:specs, map:specs).
- **Verify unificado:** Ejecutar test, typecheck, lint, validate:specs y map:specs en un solo paso dio confianza de que nada se rompió.

## Qué fricción hubo

- **Contrato de salida ambiguo:** La spec decía "imprimir" una línea; no estaba definido si la feature debía hacer `console.log` o devolver un string. El plan lo dejó como decisión de implementación; se optó por retornar string y que el caller imprima (más testeable), y se añadió un script `random-calc` después. Hubo que decidir en implement sin guía explícita en la spec.
- **Aleatoriedad en tests:** No hay RNG inyectable; los tests validan rango y suma en múltiples ejecuciones y en integración parsean la línea para comprobar a+b=c. Funciona pero es menos determinista que un test con mocks.
- **Script de verificación manual:** El plan no incluía "añadir script npm para manual verification"; se añadió en implement porque acceptance.md pedía "documentar comando exacto". Pequeña desalineación entre plan y criterio de done de acceptance.

## Mejora capturada

- **Regla/convención:** Para features con salida de consola/CLI, el **plan** (sdd-plan) debe incluir una tarea explícita: "Añadir script npm para verificación manual y documentarlo en acceptance.md". Así sdd-implement no tiene que inferir si debe crear el script y la spec queda alineada con el criterio de verificación manual.
