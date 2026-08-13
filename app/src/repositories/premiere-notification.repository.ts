// app/src/repositories/premiere-notification.repository.ts

/**
 * Repository de Suscripciones a Estrenos (HU-005)
 * ------------------------------------------------
 * Operaciones de persistencia sobre la tabla `premiereNotifications`.
 *
 * La unicidad (userId + movieId) está garantizada a doble nivel:
 *  - Aplicación: el service consulta antes de insertar (Escenario 3).
 *  - Base de datos: índice único compuesto definido en el modelo.
 */

import PremiereNotification from "../models/premiere-notification.model";

class PremiereNotificationRepository {
  /** Busca una suscripción existente (para validar duplicados). */
  async findByUserAndMovie(userId: number, movieId: number): Promise<PremiereNotification | null> {
    return await PremiereNotification.findOne({ where: { userId, movieId } });
  }

  /** Crea una nueva suscripción a un estreno. */
  async create(userId: number, movieId: number): Promise<PremiereNotification> {
    return await PremiereNotification.create({ userId, movieId });
  }
}

export default new PremiereNotificationRepository();
