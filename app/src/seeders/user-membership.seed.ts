// app/src/seeders/user-membership.seed.ts

/**
 * Seed de membresías individuales de usuario (tabla `userMemberships`).
 * Depende de `users` y `memberships`.
 *
 * A cada usuario de ejemplo se le asigna una membresía individual con su
 * propio identificador, vigencia y estado, reflejando la membresía activa
 * que ya tiene definida en `users.membershipId` (HU-006).
 */

import UserMembership from "../models/user-membership.model";

interface UserMembershipSeed {
  userEmail: string;
  membershipName: string;
  startDate: Date;
  endDate: Date | null;
  status: string;
}

function monthsFromNow(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}

export const userMembershipSeedData: UserMembershipSeed[] = [
  {
    userEmail: "juan@correo.com",
    membershipName: "Bronce",
    startDate: new Date(),
    endDate: null,
    status: "activa",
  },
  {
    userEmail: "maria@correo.com",
    membershipName: "Bronce",
    startDate: new Date(),
    endDate: null,
    status: "activa",
  },
  // Historial: una membresía anterior vencida para probar el estado "vencida"
  {
    userEmail: "juan@correo.com",
    membershipName: "Plata",
    startDate: monthsFromNow(-13),
    endDate: monthsFromNow(-1),
    status: "vencida",
  },
];

export async function seedUserMemberships(
  userIdsByEmail: Map<string, number>,
  membershipIdsByName: Map<string, number>
): Promise<void> {
  let count = 0;

  for (const data of userMembershipSeedData) {
    const userId = userIdsByEmail.get(data.userEmail);
    const membershipId = membershipIdsByName.get(data.membershipName);

    if (!userId || !membershipId) continue;

    const [record, created] = await UserMembership.findOrCreate({
      where: { userId, membershipId, startDate: data.startDate },
      defaults: {
        userId,
        membershipId,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
      },
    });
    if (created) count++;
  }

  console.log(`✔ userMemberships: ${count} registros nuevos creados`);
}
