# Tasks: random-integer-calculator

## Order and dependencies

1. **Service (lógica de dominio)** — sin dependencias de otros módulos de la feature.
2. **Adapter/controller y entrypoint** — dependen del servicio.
3. **Tests unitarios** — sobre el servicio.
4. **Tests de integración** — sobre el flujo completo (entrypoint o controller).
5. **Traceability** — al final, con rutas definitivas.

---

- [x] **T1** Implementar generación de enteros aleatorios en rango 2..200 en el servicio.  
  - Archivo: `src/features/random-integer-calculator/random-integer-calculator.service.ts`.  
  - Entregable: función que devuelva dos enteros en [2, 200] (p. ej. `getTwoRandomOperands(min, max)` o equivalente). Constantes de rango (2, 200) definidas en el servicio o en un único lugar.

- [x] **T2** Implementar cálculo de la suma en el mismo servicio.  
  - Archivo: `src/features/random-integer-calculator/random-integer-calculator.service.ts`.  
  - Entregable: función que tome dos números y devuelva su suma (o un resultado que incluya operandos + suma para uso del adapter). Puede ser una función pura `add(a, b)` o un único método que genere operandos y devuelva `{ a, b, sum }`.

- [x] **T3** Implementar formato de salida en una sola línea `<a> + <b> = <c>`.  
  - Archivo: `src/features/random-integer-calculator/random-integer-calculator.controller.js` (adapter/orquestación según convenciones del repo).  
  - Entregable: función que reciba los datos del servicio y devuelva o imprima exactamente una línea con formato `<a> + <b> = <c>`.

- [x] **T4** Exponer la feature desde el entrypoint.  
  - Archivo: `src/features/random-integer-calculator/index.ts`.  
  - Entregable: función (p. ej. `runRandomIntegerCalculatorFeature()`) que orqueste servicio + controller: generar operandos, calcular suma, producir la línea formateada (retorno o stdout según contrato del repo).

- [x] **T5** Tests unitarios de la lógica (generación en rango, suma correcta).  
  - Archivo: `tests/unit/random-integer-calculator.service.test.ts`.  
  - Criterios: dos enteros en 2..200; suma correcta; múltiples ejecuciones respetan rango (y opcionalmente formato si se prueba desde servicio).

- [x] **T6** Tests de integración del flujo completo.  
  - Archivo: `tests/integration/random-integer-calculator.controller.test.ts` (o `random-integer-calculator.test.ts` si el repo nombra por feature).  
  - Criterios: salida es una sola línea; cumple formato exacto `<a> + <b> = <c>`; valores numéricos coherentes (parseo de línea y comprobación a + b = c).

- [x] **T7** Actualizar traceability en spec y acceptance.  
  - Archivos: `specs/features/random-integer-calculator/feature.spec.md`, `specs/features/random-integer-calculator/acceptance.md`.  
  - Entregable: sección Traceability con rutas definitivas a `src/features/random-integer-calculator/index.ts`, servicio, controller; y en acceptance.md el mapeo criterio → `tests/unit/...`, `tests/integration/...`.

---

## Riesgos y dependencias

- **Aleatoriedad:** Los tests unitarios pueden validar rango y suma en múltiples ejecuciones; para formato estable, los tests de integración pueden parsear la línea y comprobar `a + b = c`. Si el repo exige determinismo en tests, valorar un generador inyectable (optional).
- **Contrato de salida:** Definir si la feature escribe en stdout o solo retorna string; T3/T4 deben alinearse con la convención (p. ej. hello-world retorna objeto; aquí la spec pide “imprimir” una línea — confirmar en implementación si se usa `console.log` desde adapter/entrypoint o se retorna string para el caller).
- **Tipos compartidos:** Si se usan tipos en `src/shared/types/`, limitarse a referencias; no crear nuevos tipos compartidos en este plan (scope sdd-plan).
