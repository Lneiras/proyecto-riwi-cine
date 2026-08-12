// app/src/seeders/movie-genre.seed.ts

/**
 * Seed de géneros de película (tabla `movieGenres`).
 */

import MovieGenre from "../models/movie-genre.model";

export const movieGenreSeedData = [
  { name: "Acción" },
  { name: "Comedia" },
  { name: "Drama" },
  { name: "Terror" },
  { name: "Animación" },
  { name: "Ciencia Ficción" },
  { name: "Suspenso" },
  { name: "Familiar" },
];

export async function seedMovieGenres(): Promise<Map<string, number>> {
  const idsByName = new Map<string, number>();

  for (const data of movieGenreSeedData) {
    const [genre] = await MovieGenre.findOrCreate({
      where: { name: data.name },
      defaults: data,
    });
    idsByName.set(genre.name, genre.id);
  }

  console.log(`✔ movieGenres: ${idsByName.size} registros listos`);
  return idsByName;
}
