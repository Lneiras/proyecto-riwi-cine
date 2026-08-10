
// app/src/routes/movie.routes.ts

import { Router } from "express";
import { MovieController } from "../controllers/movie.controller";

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
 *     responses:
 *       200:
 *         description: Lista de películas publicadas con funciones en los próximos 7 días (puede ser un arreglo vacío)
 *       400:
 *         description: Parámetro de query inválido (ej. cityId no numérico)
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
 *     responses:
 *       200:
 *         description: Lista de películas con funciones restantes hoy
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
 *     responses:
 *       200:
 *         description: Lista de películas que cumplen todos los filtros combinados (arreglo vacío si ninguna coincide — Escenario 3)
 *       400:
 *         description: Parámetro inválido o dateFrom posterior a dateTo
 */
router.get("/filter", MovieController.getFilter);

export default router;