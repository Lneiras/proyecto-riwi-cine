// app/src/seeders/country.seed.ts

/**
 * Seed de países. Usa el modelo `Country` ya existente en HU-002
 * (tabla `countries`). Idempotente: `findOrCreate` por `name`.
 */

import Country from "../models/country.model";

export const countrySeedData = [{ name: "Colombia" }, { name: "México" }, { name: "Perú" }];

export async function seedCountries(): Promise<Map<string, number>> {
  const idsByName = new Map<string, number>();

  for (const data of countrySeedData) {
    const [country] = await Country.findOrCreate({
      where: { name: data.name },
      defaults: data,
    });
    idsByName.set(country.name, country.id);
  }

  console.log(`✔ countries: ${idsByName.size} registros listos`);
  return idsByName;
}
