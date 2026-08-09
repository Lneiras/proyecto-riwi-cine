// app/src/seeders/cinema.seed.ts

/**
 * Seed de cines (tabla `cinemas`). Depende de `cities`.
 */

import Cinema from "../models/cinema.model";

interface CinemaSeed {
  name: string;
  address: string;
  cityName: string;
}

export const cinemaSeedData: CinemaSeed[] = [
  { name: "Cineplex Medellín", address: "Cra. 43A #1-50, El Poblado", cityName: "Medellín" },
  { name: "Cineplex Bogotá", address: "Calle 100 #15-20, Usaquén", cityName: "Bogotá" },
  { name: "Cineplex Cali", address: "Av. 6N #23-45, Granada", cityName: "Cali" },
];

export async function seedCinemas(cityIdsByName: Map<string, number>): Promise<Map<string, number>> {
  const idsByName = new Map<string, number>();

  for (const data of cinemaSeedData) {
    const cityId = cityIdsByName.get(data.cityName);
    if (!cityId) {
      throw new Error(`No se encontró la ciudad "${data.cityName}" para el cine "${data.name}"`);
    }

    const [cinema] = await Cinema.findOrCreate({
      where: { name: data.name },
      defaults: { name: data.name, address: data.address, cityId },
    });
    idsByName.set(cinema.name, cinema.id);
  }

  console.log(`✔ cinemas: ${idsByName.size} registros listos`);
  return idsByName;
}
