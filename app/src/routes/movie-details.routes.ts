import { Router } from "express";
import {getMovieById, getFutureShowtimes} from "../controllers/movie-details.controller";

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


/**
 * GET /:id/functions
 * ----
 * Obtiene las funciones (showtimes) futuras y disponibles de una película,
 * filtradas por la ciudad seleccionada.
 * 
 * Request Parameters:
 *  - `id`: number (obligatorio) - ID de la película.
 *  - `cityId`: number (obligatorio, query param) - ID de la ciudad seleccionada por el usuario.
 * Response:
 *  - 200 OK: Retorna un array de funciones en formato JSON.
 *  - 400 Bad Request: Si no se envía `cityId`.
 *  - 500 Internal Server Error: En caso de error en la consulta.
 * 
 * @swagger
 * /api/movies/{id}/functions:
 *   get:
 *     summary: Obtener las funciones disponibles de una película por ciudad
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la película
 *       - in: query
 *         name: cityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ciudad seleccionada, para filtrar las funciones
 *     responses:
 *       200:
 *         description: Funciones obtenidas exitosamente (puede ser un array vacío si no hay funciones disponibles en esa ciudad)
 *         content:
 *           application/json:
 *             example:
 *               - id: 10
 *                 movieId: 1
 *                 roomId: 2
 *                 formatId: 3
 *                 languageId: 1
 *                 dateTime: "2026-08-15T20:30:00.000Z"
 *                 basePrice: 18000
 *                 format:
 *                   id: 3
 *                   name: "IMAX"
 *                 language:
 *                   id: 1
 *                   name: "Subtitulada"
 *                 room:
 *                   id: 2
 *                   name: "Sala 2"
 *                   cinemaId: 1
 *                 cinema:
 *                   id: 1
 *                   name: "Multicine Buenavista"
 *                   cityId: 3
 *       400:
 *         description: Falta el parámetro cityId
 *         content:
 *           application/json:
 *             example:
 *               error: "cityId is required as a query param"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener las funciones"
 */
router.get("/:id/functions", getFutureShowtimes);

export default router;