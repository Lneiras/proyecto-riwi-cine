// app/src/seeders/user-genre.seed.ts

/**
 * Seed de géneros de usuario (tabla `userGenres`).
 */

import UserGenre from "../models/user-genre.model";

export const userGenreSeedData = [
  { name: "Masculino" },
  { name: "Femenino" },
  { name: "Otro" },
  { name: "Prefiero no decirlo" },
];

export async function seedUserGenres(): Promise<Map<string, number>> {
  const idsByName = new Map<string, number>();

  for (const data of userGenreSeedData) {
    const [genre] = await UserGenre.findOrCreate({
      where: { name: data.name },
      defaults: data,
    });
    idsByName.set(genre.name, genre.id);
  }

  console.log(`✔ userGenres: ${idsByName.size} registros listos`);
  return idsByName;
}
