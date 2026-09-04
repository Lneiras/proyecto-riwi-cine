// app/src/utils/time.ts

/**
 * Utilidades de tiempo
 * --------------------
 * Convierte duraciones en formato "15m", "7d", "30d" (estilo jsonwebtoken)
 * a milisegundos, para poder guardar la fecha de expiración en la BD.
 */

const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
};

/**
 * Devuelve los milisegundos representados por una duración legible.
 * Ejemplos: "15m" -> 900000, "7d" -> 604800000.
 */
export function durationToMs(duration: string): number {
  const match = /^(\d+)([smhdw])$/.exec(duration.trim());
  if (!match) {
    throw new Error(`Duración inválida: "${duration}". Usa formato como "15m", "7d".`);
  }
  return parseInt(match[1], 10) * UNIT_MS[match[2]];
}
