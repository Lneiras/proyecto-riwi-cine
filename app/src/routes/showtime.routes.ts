import { Router } from "express";
import { getFunctionById, getFunctionPrice} from "../controllers/movie-details.controller";

const router = Router();

/**
 * @swagger
 * /api/functions/{id}:
 *   get:
 *     summary: Obtener el detalle de una función específica (HU-009)
 *     tags: [Functions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la función (showtime)
 *     responses:
 *       200:
 *         description: Detalle de la función obtenido exitosamente
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               dateTime: "2026-08-20T19:00:00.000Z"
 *               basePrice: 18000
 *               Format:
 *                 name: "IMAX"
 *               Language:
 *                 name: "Subtitulada"
 *               Room:
 *                 name: "Sala 3"
 *                 Cinema:
 *                   name: "Cineplex Medellín"
 *       404:
 *         description: La función no existe
 */
router.get("/:id", getFunctionById); // GET /api/functions/:id

/**
 * @swagger
 * /api/functions/{id}/prices:
 *   get:
 *     summary: Obtener el precio dinámico de una función específica (HU-009)
 *     tags: [Functions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la función (showtime)
 *     responses:
 *       200:
 *         description: Precio calculado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               functionId: 1
 *               basePrice: 18000
 *               finalPrice: 31000
 *       404:
 *         description: La función no existe
 */
router.get("/:id/prices", getFunctionPrice); // GET /api/functions/:id/prices

export default router;