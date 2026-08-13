// app/src/seeders/role.seed.ts

/**
 * Seed de roles (tabla `roles`).
 * Valores base del sistema: Cliente y Admin.
 */

import Role from "../models/role.model";

export const roleSeedData = [{ name: "Cliente" }, { name: "Admin" }];

export async function seedRoles(): Promise<Map<string, number>> {
  const idsByName = new Map<string, number>();

  for (const data of roleSeedData) {
    const [role] = await Role.findOrCreate({
      where: { name: data.name },
      defaults: data,
    });
    idsByName.set(role.name, role.id);
  }

  console.log(`✔ roles: ${idsByName.size} registros listos`);
  return idsByName;
}
