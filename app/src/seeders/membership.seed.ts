// app/src/seeders/membership.seed.ts

/**
 * Seed de membresías (tabla `memberships`).
 * Niveles: Bronce, Plata, Oro y Platino, con sus descuentos y umbral de puntos.
 */

import Membership from "../models/membership.model";

export const membershipSeedData = [
  { name: "Bronce", ticketDiscount: 0, snackDiscount: 0, minPoints: 0 },
  { name: "Plata", ticketDiscount: 5, snackDiscount: 3, minPoints: 100 },
  { name: "Oro", ticketDiscount: 10, snackDiscount: 5, minPoints: 300 },
  { name: "Platino", ticketDiscount: 15, snackDiscount: 10, minPoints: 600 },
];

export async function seedMemberships(): Promise<Map<string, number>> {
  const idsByName = new Map<string, number>();

  for (const data of membershipSeedData) {
    const [membership] = await Membership.findOrCreate({
      where: { name: data.name },
      defaults: data,
    });
    idsByName.set(membership.name, membership.id);
  }

  console.log(`✔ memberships: ${idsByName.size} registros listos`);
  return idsByName;
}
