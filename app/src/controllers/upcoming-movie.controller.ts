// app/src/controllers/upcoming-movie.controller.ts

/**
 * Controlador de Próximos Estrenos (HU-005)
 * -----------------------------------------
 * Expone los endpoints de listado/detalle de próximos estrenos y la
 * suscripción a notificaciones. Delega toda la lógica al service.
 */

import { Request, Response, NextFunction } from "express";
import upcomingMovieService from "../services/upcoming-movie.service";
import { successResponse } from "../utils/apiResponse";

export class UpcomingMovieController {
  /** GET /api/v1/movies/upcoming — Escenario 1 (listado con countdown y tráiler). */
  static async getUpcoming(_req: Request, res: Response, next: NextFunction) {
    try {
      const movies = await upcomingMovieService.listUpcoming();
      return successResponse(res, movies);
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/v1/movies/upcoming/:id — detalle de un próximo estreno. */
  static async getUpcomingById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const movie = await upcomingMovieService.getUpcomingById(id);
      return successResponse(res, movie);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/v1/notifications/upcoming — suscripción autenticada. */
  static async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const movieId = req.body?.movieId;

      if (!userId) {
        return res.status(401).json({ error: "Token de acceso requerido" });
      }
      if (!Number.isInteger(movieId)) {
        return res.status(400).json({ error: "movieId es requerido y debe ser un número entero" });
      }

      const notification = await upcomingMovieService.subscribe(userId, movieId);
      return successResponse(res, notification, 201);
    } catch (err) {
      next(err);
    }
  }
}
