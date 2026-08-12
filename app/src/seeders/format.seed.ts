// app/src/seeders/format.seed.ts

/**
 * Seed de formatos (tabla `formats`).
 */

import Format from "../models/format.model";

export const formatSeedData = [{ name: "2D" }, { name: "3D" }, { name: "4DX" }, { name: "IMAX" }];

export async function seedFormats(): Promise<Map<string, number>> {
  const idsByName = new Map<string, number>();

  for (const data of formatSeedData) {
    const [format] = await Format.findOrCreate({
      where: { name: data.name },
      defaults: data,
    });
    idsByName.set(format.name, format.id);
  }

  console.log(`✔ formats: ${idsByName.size} registros listos`);
  return idsByName;
}
