import { Router} from "express";
import { getSeats } from "../controllers/seat.controller";



const router = Router();

/**
 * @swagger
 * /api/v1/functions/{id}/seats:
 *   get:
 *     summary: Obtener los asientos de una función
 *     description: Obtiene todos los asientos de la sala asociada a una función y devuelve su tipo (General, Preferencial o VIP), estado actual y fecha de expiración del bloqueo cuando corresponda.
 *     tags:
 *       - Seats
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la función
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Asientos obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     showtimeId:
 *                       type: integer
 *                       example: 1
 *                     roomId:
 *                       type: integer
 *                       example: 2
 *                     seats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 15
 *                           row:
 *                             type: string
 *                             example: A
 *                           number:
 *                             type: integer
 *                             example: 5
 *                           type:
 *                             type: string
 *                             enum:
 *                               - General
 *                               - Preferencial
 *                               - VIP
 *                             example: General
 *                           status:
 *                             type: string
 *                             enum:
 *                               - available
 *                               - reserved
 *                               - sold
 *                               - disabled
 *                             example: available
 *                           expiresAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                             example: null
 *
 *       400:
 *         description: El ID de la función no es válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: El id de la función debe ser un número entero
 *
 *       500:
 *         description: Error interno al obtener los asientos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Función no encontrada
 */

router.get("/:id/seats",getSeats);

export default router;