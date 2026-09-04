// app/src/repositories/upcoming-movie.repository.ts

/**
 * Repository de Próximos Estrenos y Notificaciones (HU-005)
 * ---------------------------------------------------------
 * Encapsula los queries de Sequelize para:
 *  - Listado/detalle de películas en estado "proximo_estreno" (Task 1).
 *  - Suscripción de usuarios a un estreno con unicidad userId + movieId.
 *  - Consulta y marcado de notificaciones pendientes para el job (Task 2).
 *
 * No conoce reglas de negocio (qué es "próximo estreno") — eso lo decide
 * el service, igual que en el repository de cartelera.
 */

import { Op } from "sequelize";
import { Movie, MovieGenre, MovieStatus, PremiereNotification, User } from "../models";

class UpcomingMovieRepository {
  /** Películas en estado "proximo_estreno", ordenadas por fecha de estreno ASC. */
  async findUpcomingMovies(statusName: string): Promise<Movie[]> {
    return await Movie.findAll({
      include: [
        { model: MovieStatus, attributes: ["id", "name"], required: true, where: { name: statusName } },
        { model: MovieGenre, attributes: ["id", "name"] },
      ],
      order: [["releaseDate", "ASC"]],
    });
  }

  /** Detalle de una película en estado "proximo_estreno" por id. */
  async findUpcomingMovieById(id: number, statusName: string): Promise<Movie | null> {
    return await Movie.findOne({
      where: { id },
      include: [
        { model: MovieStatus, attributes: ["id", "name"], required: true, where: { name: statusName } },
        { model: MovieGenre, attributes: ["id", "name"] },
      ],
    });
  }

  /** Notificaciones pendientes (no enviadas) de películas ya en cartelera ("publicada"). */
  async findPendingNotifications(publishedStatusName: string): Promise<PremiereNotification[]> {
    return await PremiereNotification.findAll({
      where: { notifiedAt: null },
      include: [
        {
          model: Movie,
          required: true,
          include: [
            {
              model: MovieStatus,
              attributes: [],
              required: true,
              where: { name: publishedStatusName },
            },
          ],
        },
        { model: User, attributes: ["id", "name", "email"], required: true },
      ],
    });
  }

  /** Marca como enviadas las notificaciones indicadas. */
  async markAsNotified(ids: number[], at: Date = new Date()): Promise<void> {
    await PremiereNotification.update(
      { notifiedAt: at },
      { where: { id: { [Op.in]: ids } } }
    );
  }
}

export default new UpcomingMovieRepository();
