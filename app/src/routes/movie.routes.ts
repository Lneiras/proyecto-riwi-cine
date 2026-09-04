

import { Router } from "express";
import { MovieController } from "../controllers/movie.controller";
import { UpcomingMovieController } from "../controllers/upcoming-movie.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/movies/weekly:
 *   get:
 *     summary: Cartelera de los próximos 7 días
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: cityId
 *         schema: { type: integer }
 *         description: Filtra funciones por ciudad (vía sala → cine → ciudad)
 *       - in: query
 *         name: genreId
 *         schema: { type: integer }
 *       - in: query
 *         name: formatId
 *         schema: { type: integer }
 *       - in: query
 *         name: languageId
 *         schema: { type: integer }
 *       - in: query
 *         name: rating
 *         schema: { type: string }
 *         example: "PG-13"
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 50 }
 *     responses:
 *       200:
 *         description: Lista paginada de películas publicadas con funciones en los próximos 7 días (puede ser un arreglo vacío)
 *       400:
 *         description: Parámetro de query inválido (ej. cityId no numérico, limit fuera de rango)
 */
router.get("/weekly", MovieController.getWeekly);

/**
 * @swagger
 * /api/v1/movies/today:
 *   get:
 *     summary: Cartelera exclusiva del día actual
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: cityId
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 50 }
 *     responses:
 *       200:
 *         description: Lista paginada de películas con funciones restantes hoy
 *       400:
 *         description: Parámetro de query inválido
 */
router.get("/today", MovieController.getToday);

/**
 * @swagger
 * /api/v1/movies/filter:
 *   get:
 *     summary: Cartelera con filtros combinables y rango de fecha libre
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: cityId
 *         schema: { type: integer }
 *       - in: query
 *         name: genreId
 *         schema: { type: integer }
 *       - in: query
 *         name: formatId
 *         schema: { type: integer }
 *       - in: query
 *         name: languageId
 *         schema: { type: integer }
 *       - in: query
 *         name: rating
 *         schema: { type: string }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *         example: "2026-08-10"
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date }
 *         example: "2026-08-17"
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 50 }
 *     responses:
 *       200:
 *         description: Lista paginada de películas que cumplen todos los filtros combinados (arreglo vacío si ninguna coincide — Escenario 3)
 *       400:
 *         description: Parámetro inválido, limit fuera de rango, o dateFrom posterior a dateTo
 */
router.get("/filter", MovieController.getFilter);

/**
 * @swagger
 * /api/v1/movies/upcoming:
 *   get:
 *     summary: Listado de próximos estrenos (HU-005 Escenario 1)
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Películas en estado "proximo_estreno" ordenadas por fecha de estreno, con contador regresivo (daysUntilRelease) y tráiler (trailerUrl)
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 6
 *                   title: "Susurros del Bosque"
 *                   durationMinutes: 110
 *                   rating: "PG-13"
 *                   synopsis: "Dos hermanas separadas por años de silencio..."
 *                   releaseDate: "2026-09-04"
 *                   posterUrl: "https://cdn.multicine.example.com/posters/susurros-del-bosque.jpg"
 *                   bannerUrl: "https://cdn.multicine.example.com/banners/susurros-del-bosque.jpg"
 *                   trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *                   daysUntilRelease: 23
 *                   genre:
 *                     id: 5
 *                     name: "Drama"
 *                   status:
 *                     id: 3
 *                     name: "proximo_estreno"
 *       500:
 *         description: Error interno del servidor
 */
router.get("/upcoming", UpcomingMovieController.getUpcoming);

/**
 * @swagger
 * /api/v1/movies/upcoming/{id}:
 *   get:
 *     summary: Detalle de un próximo estreno (HU-005 Escenario 1)
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la película
 *     responses:
 *       200:
 *         description: Detalle de la película en estado "proximo_estreno" con contador regresivo
 *       404:
 *         description: Película no encontrada o no es un próximo estreno
 *         content:
 *           application/json:
 *             example:
 *               error: "Película no encontrada o no es un próximo estreno"
 */
router.get("/upcoming/:id", UpcomingMovieController.getUpcomingById);

export default router;