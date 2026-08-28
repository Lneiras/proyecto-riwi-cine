// app/src/seeders/notification-preference.seed.ts

/**
 * Seed de preferencias de notificación (tabla `notificationPreferences`).
 * Configura preferencias iniciales para los usuarios demo (HU-006 / HU-015).
 */

import NotificationPreference from "../models/notification-preference.model";

export interface NotificationPreferenceSeed {
  userEmail: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  commercialEnabled: boolean;
}

export const notificationPreferenceSeedData: NotificationPreferenceSeed[] = [
  {
    userEmail: "juan@correo.com",
    emailEnabled: true,
    smsEnabled: false,
    commercialEnabled: true,
  },
  {
    userEmail: "maria@correo.com",
    emailEnabled: true,
    smsEnabled: false,
    commercialEnabled: false,
  },
  {
    userEmail: "jose@correo.com",
    emailEnabled: true,
    smsEnabled: false,
    commercialEnabled: false,
  },
  {
    userEmail: "franco@correo.com",
    emailEnabled: true,
    smsEnabled: true,
    commercialEnabled: true,
  },
];

export async function seedNotificationPreferences(
  userIdsByEmail: Map<string, number>
): Promise<void> {
  let count = 0;

  for (const data of notificationPreferenceSeedData) {
    const userId = userIdsByEmail.get(data.userEmail);
    if (!userId) continue;

    const [, created] = await NotificationPreference.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        emailEnabled: data.emailEnabled,
        smsEnabled: data.smsEnabled,
        commercialEnabled: data.commercialEnabled,
      },
    });

    if (created) count++;
  }

  console.log(`✔ notificationPreferences: ${count} registros nuevos creados`);
}
