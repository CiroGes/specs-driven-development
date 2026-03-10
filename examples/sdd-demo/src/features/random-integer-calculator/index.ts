import { buildOutputLine } from "./random-integer-calculator.controller.js";
import { computeRandomSum } from "./random-integer-calculator.service.js";

/**
 * Ejecuta la feature: genera dos enteros en 2..200, calcula la suma y devuelve
 * una sola línea con formato "<a> + <b> = <c>". El caller puede imprimirla (p. ej. console.log).
 */
export function runRandomIntegerCalculatorFeature(): string {
  const result = computeRandomSum();
  return buildOutputLine(result);
}
