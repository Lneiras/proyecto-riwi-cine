// app/src/seeders/movie-status.seed.ts

/**
 * Seed de estados de película (tabla `movieStatuses`).
 * Valores fijos: borrador, publicada, proximo_estreno, despublicada.
 */

import MovieStatus from "../models/movie-status.model";

export const movieStatusSeedData = [
  { name: "borrador" },
  { name: "publicada" },
  { name: "proximo_estreno" },
  { name: "despublicada" },
];

export async function seedMovieStatuses(): Promise<Map<string, number>> {
  const idsByName = new Map<string, number>();

  for (const data of movieStatusSeedData) {
    const [status] = await MovieStatus.findOrCreate({
      where: { name: data.name },
      defaults: data,
    });
    idsByName.set(status.name, status.id);
  }

  console.log(`✔ movieStatuses: ${idsByName.size} registros listos`);
  return idsByName;
}
