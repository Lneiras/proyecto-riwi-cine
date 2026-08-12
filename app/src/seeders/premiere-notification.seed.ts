// app/src/seeders/premiere-notification.seed.ts

/**
 * Seed de notificaciones de estreno (tabla `premiereNotifications`).
 * Depende de `users` y `movies`. Usa un par de suscripciones de ejemplo
 * sobre las películas en estado "proximo_estreno" (HU-005).
 */

import PremiereNotification from "../models/premiere-notification.model";

interface PremiereNotificationSeed {
  userEmail: string;
  movieTitle: string;
}

export const premiereNotificationSeedData: PremiereNotificationSeed[] = [
  { userEmail: "juan@correo.com", movieTitle: "Última Frontera" },
  { userEmail: "maria@correo.com", movieTitle: "Última Frontera" },
  { userEmail: "juan@correo.com", movieTitle: "Susurros del Bosque" },
];

export async function seedPremiereNotifications(
  userIdsByEmail: Map<string, number>,
  movieIdsByTitle: Map<string, number>
): Promise<void> {
  let count = 0;

  for (const data of premiereNotificationSeedData) {
    const userId = userIdsByEmail.get(data.userEmail);
    const movieId = movieIdsByTitle.get(data.movieTitle);

    // Si el usuario o la película no existen (ej. alguien corrió los
    // seeders parcialmente), se omite en vez de fallar todo el proceso.
    if (!userId || !movieId) continue;

    const [, created] = await PremiereNotification.findOrCreate({
      where: { userId, movieId },
      defaults: { userId, movieId },
    });
    if (created) count++;
  }

  console.log(`✔ premiereNotifications: ${count} registros nuevos creados`);
}
