// app/src/services/upcoming-movie.service.ts

/**
 * Service de Próximos Estrenos (HU-005)
 * --------------------------------------
 * Contiene la lógica de negocio de:
 *  - Listado y detalle de próximos estrenos con contador regresivo (Escenario 1).
 *  - Registro de suscripciones con validación de duplicados (Escenarios 2 y 3).
 *
 * Reglas de negocio aquí:
 *  - "Próximo estreno" = estado `proximo_estreno`.
 *  - El contador regresivo son los días restantes hasta `releaseDate`.
 */

import { AppError } from "../utils/apiResponse";
import UpcomingMovieRepository from "../repositories/upcoming-movie.repository";
import PremiereNotificationRepository from "../repositories/premiere-notification.repository";
import Movie from "../models/movie.model";
import PremiereNotification from "../models/premiere-notification.model";

const UPCOMING_STATUS = "proximo_estreno";

/** Días restantes desde hoy hasta la fecha de estreno (contador regresivo). */
function daysUntilRelease(releaseDate: Date | string | null): number | null {
  if (!releaseDate) return null;
  const date = typeof releaseDate === "string" ? new Date(releaseDate + "T00:00:00") : releaseDate;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const release = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  return Math.ceil((release.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Decorado de respuesta del Escenario 1: película + countdown. */
function withCountdown(movie: Movie): Record<string, unknown> {
  const { MovieStatus: status, MovieGenre: genre, ...rest } = movie.get() as unknown as Record<
    string,
    unknown
  > & {
    MovieGenre?: { id: number; name: string } | null;
    MovieStatus?: { id: number; name: string } | null;
  };
  return {
    ...rest,
    daysUntilRelease: daysUntilRelease(movie.releaseDate),
    genre,
    status,
  };
}

class UpcomingMovieService {
  /** Escenario 1: listado de próximos estrenos ordenado por fecha. */
  async listUpcoming(): Promise<Record<string, unknown>[]> {
    const movies = await UpcomingMovieRepository.findUpcomingMovies(UPCOMING_STATUS);
    return movies.map(withCountdown);
  }

  /** Escenario 1: detalle de un próximo estreno. */
  async getUpcomingById(id: number): Promise<Record<string, unknown>> {
    const movie = await UpcomingMovieRepository.findUpcomingMovieById(id, UPCOMING_STATUS);
    if (!movie) {
      throw new AppError("Película no encontrada o no es un próximo estreno", 404, "NOT_FOUND");
    }
    return withCountdown(movie);
  }

  /** Escenario 2: registra la suscripción. Escenario 3: rechaza duplicados. */
  async subscribe(userId: number, movieId: number): Promise<PremiereNotification> {
    const movie = await UpcomingMovieRepository.findUpcomingMovieById(movieId, UPCOMING_STATUS);
    if (!movie) {
      throw new AppError("Película no encontrada o no es un próximo estreno", 404, "NOT_FOUND");
    }

    const existing = await PremiereNotificationRepository.findByUserAndMovie(userId, movieId);
    if (existing) {
      throw new AppError(
        "Ya estás suscrito para recibir la notificación de este estreno",
        409,
        "DUPLICATE_SUBSCRIPTION"
      );
    }

    return await PremiereNotificationRepository.create(userId, movieId);
  }
}

export default new UpcomingMovieService();
