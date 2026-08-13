// app/src/seeders/user.seed.ts

/**
 * Seed de usuarios demo (tabla `users`).
 *
 * Las contraseñas se hashean con bcryptjs al momento de ejecutar el seed
 * (la contraseña demo es `password123`), listas para probar el login JWT.
 */

import bcrypt from "bcryptjs";
import User from "../models/user.model";

export const demoPassword = "password123";

export interface UserSeed {
  name: string;
  email: string;
  password: string;
  roleName: string;
  membershipName: string;
  cityId: number | null;
}

export const userSeedData: UserSeed[] = [
  {
    name: "Juan Pérez",
    email: "juan@correo.com",
    password: demoPassword,
    roleName: "Cliente",
    membershipName: "Bronce",
    cityId: 1,
  },
  {
    name: "María López",
    email: "maria@correo.com",
    password: demoPassword,
    roleName: "Cliente",
    membershipName: "Bronce",
    cityId: 2,
  },
];

export async function seedUsers(
  roleIdsByName: Map<string, number>,
  membershipIdsByName: Map<string, number>
): Promise<Map<string, number>> {
  const idsByEmail = new Map<string, number>();
  const passwordHash = bcrypt.hashSync(demoPassword, 10);

  for (const data of userSeedData) {
    const roleId = roleIdsByName.get(data.roleName);
    const membershipId = membershipIdsByName.get(data.membershipName);

    if (!roleId) throw new Error(`No se encontró el rol "${data.roleName}"`);
    if (!membershipId) throw new Error(`No se encontró la membresía "${data.membershipName}"`);

    const [user] = await User.findOrCreate({
      where: { email: data.email },
      defaults: {
        name: data.name,
        email: data.email,
        passwordHash,
        roleId,
        membershipId,
        cityId: data.cityId,
        userGenreId: null,
        emailVerified: false,
        accountStatus: "activa",
      },
    });
    idsByEmail.set(user.email, user.id);
  }

  console.log(`✔ users: ${idsByEmail.size} registros listos`);
  return idsByEmail;
}
