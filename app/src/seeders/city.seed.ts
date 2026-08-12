// app/src/seeders/city.seed.ts

/**
 * Seed de ciudades. Usa el modelo `City` ya existente en HU-002
 * (archivo `cities.model.ts`, tabla `cities`).
 */

import City from "../models/cities.model";

interface CitySeed {
  name: string;
  departmentName: string;
}

export const citySeedData: CitySeed[] = [
  { name: "Medellín", departmentName: "Antioquia" },
  { name: "Envigado", departmentName: "Antioquia" },
  { name: "Bogotá", departmentName: "Cundinamarca" },
  { name: "Cali", departmentName: "Valle del Cauca" },
  { name: "Ciudad de México", departmentName: "Ciudad de México" },
  { name: "Lima", departmentName: "Lima" },
];

export async function seedCities(departmentIdsByName: Map<string, number>): Promise<Map<string, number>> {
  const idsByName = new Map<string, number>();

  for (const data of citySeedData) {
    const departmentId = departmentIdsByName.get(data.departmentName);
    if (!departmentId) {
      throw new Error(`No se encontró el departamento "${data.departmentName}" para la ciudad "${data.name}"`);
    }

    const [city] = await City.findOrCreate({
      where: { name: data.name, departmentId },
      defaults: { name: data.name, departmentId },
    });
    idsByName.set(city.name, city.id);
  }

  console.log(`✔ cities: ${idsByName.size} registros listos`);
  return idsByName;
}
