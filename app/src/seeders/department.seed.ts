// app/src/seeders/department.seed.ts

/**
 * Seed de departamentos. Usa el modelo `Department` ya existente en
 * HU-002 (archivo `departament.model.ts`, tabla `departments`).
 */

import Department from "../models/departament.model";

interface DepartmentSeed {
  name: string;
  countryName: string;
}

export const departmentSeedData: DepartmentSeed[] = [
  { name: "Antioquia", countryName: "Colombia" },
  { name: "Cundinamarca", countryName: "Colombia" },
  { name: "Valle del Cauca", countryName: "Colombia" },
  { name: "Ciudad de México", countryName: "México" },
  { name: "Lima", countryName: "Perú" },
];

export async function seedDepartments(countryIdsByName: Map<string, number>): Promise<Map<string, number>> {
  const idsByName = new Map<string, number>();

  for (const data of departmentSeedData) {
    const countryId = countryIdsByName.get(data.countryName);
    if (!countryId) {
      throw new Error(`No se encontró el país "${data.countryName}" para el departamento "${data.name}"`);
    }

    const [department] = await Department.findOrCreate({
      where: { name: data.name, countryId },
      defaults: { name: data.name, countryId },
    });
    idsByName.set(department.name, department.id);
  }

  console.log(`✔ departments: ${idsByName.size} registros listos`);
  return idsByName;
}
