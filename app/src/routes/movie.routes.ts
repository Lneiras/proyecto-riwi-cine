import { Router } from "express";
import {getMovieById} from "../controllers/movie.controller";

const router = Router();


/**
 * GET /:id
 * ----
 * Obtiene los detalles de una película especifica por su ID.
 * 
 * Request Parameters:
 *  - `id`: number (obligatorio) - ID de la película a buscar.
 * Response:
 *  - 200 OK: Retorna los detalles de la película en formato JSON.
 *  - 404 Not Found: En caso de que no se encuentre la película.
 *  - 500 Internal Server Error: En caso de error en la consulta.
 * 
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Obtener detalles de una película por ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la película a obtener
 *     responses:
 *       200:
 *         description: Película obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               title: "Misión Imposible 9"
 *               durationMinutes: 145
 *               rating: "PG-13"
 *               genreId: 3
 *               synopsis: "Ethan Hunt regresa para una última misión..."
 *               releaseDate: "2026-06-15"
 *               posterUrl: "https://cdn.multicine.com/posters/mi9.jpg"
 *               bannerUrl: "https://cdn.multicine.com/banners/mi9.jpg"
 *               trailerUrl: "https://www.youtube.com/watch?v=abc123"
 *               statusId: 2
 *               genre:
 *                 id: 3
 *                 name: "Acción"
 *               status:
 *                 id: 2
 *                 name: "En Cartelera"
 *       404:
 *         description: Película no encontrada
 *         content:
 *           application/json:
 *             example:
 *               error: "Movie not found"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener la película"
 */

router.get("/:id", getMovieById);

export default router;