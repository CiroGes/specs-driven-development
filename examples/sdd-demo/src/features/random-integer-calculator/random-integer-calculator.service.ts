/** Rango definido en spec: 2..200 inclusive. */
export const MIN_OPERAND = 2;
export const MAX_OPERAND = 200;

export interface RandomSumResult {
  a: number;
  b: number;
  sum: number;
}

/**
 * Genera un entero aleatorio en [min, max] inclusive.
 * No inyectamos RNG para mantener la feature mínima; tests validan rango en múltiples ejecuciones.
 */
function randomIntInclusive(min: number, max: number): number {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

/**
 * Genera dos enteros aleatorios en [MIN_OPERAND, MAX_OPERAND] y devuelve operandos y suma.
 */
export function getTwoRandomOperands(min: number = MIN_OPERAND, max: number = MAX_OPERAND): [number, number] {
  return [randomIntInclusive(min, max), randomIntInclusive(min, max)];
}

/**
 * Suma dos números (función pura para tests y uso del adapter).
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Genera dos operandos en rango, calcula la suma y devuelve el resultado para el adapter.
 */
export function computeRandomSum(): RandomSumResult {
  const [a, b] = getTwoRandomOperands();
  return { a, b, sum: add(a, b) };
}
