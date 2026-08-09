// app/src/seeders/user.seed.ts

/**
 * Seed de usuarios demo (tabla `users`).
 *
 * Nota: `password` NO es un hash real, es un valor de marcador de
 * posición porque el flujo de registro con hashing (HU-006) todavía no
 * existe. Cuando se implemente, hay que re-hashear o reemplazar estos
 * usuarios demo antes de usarlos para probar login.
 */

import User from "../models/user.model";

export const userSeedData = [
  { name: "Juan Pérez", email: "juan@correo.com", password: "demo-password-not-hashed" },
  { name: "María López", email: "maria@correo.com", password: "demo-password-not-hashed" },
];

export async function seedUsers(): Promise<Map<string, number>> {
  const idsByEmail = new Map<string, number>();

  for (const data of userSeedData) {
    const [user] = await User.findOrCreate({
      where: { email: data.email },
      defaults: data,
    });
    idsByEmail.set(user.email, user.id);
  }

  console.log(`✔ users: ${idsByEmail.size} registros listos`);
  return idsByEmail;
}
