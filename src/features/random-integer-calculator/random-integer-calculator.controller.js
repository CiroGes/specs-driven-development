/**
 * Formatea el resultado del servicio en una sola línea: "<a> + <b> = <c>"
 * @param {{ a: number, b: number, sum: number }} result
 * @returns {string}
 */
export function buildOutputLine(result) {
  const { a, b, sum } = result;
  return `${a} + ${b} = ${sum}`;
}
