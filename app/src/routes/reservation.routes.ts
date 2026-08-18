import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import {
  lockSeats,
  releaseSeats,
  getReservationSummary,
} from "../controllers/seat.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/reservations/lock-seats:
 *   post:
 *     summary: Bloquear asientos temporalmente
 *     tags:
 *       - Reservations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - functionId
 *               - seatIds
 *             properties:
 *               functionId:
 *                 type: integer
 *                 example: 1
 *               seatIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Asientos bloqueados correctamente
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
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                     seatIds:
 *                       type: array
 *                       maxItems: 6
 *                       minItems: 1
 *                       items:
 *                         type: integer
 *                       example: [1, 2, 3]
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     unitPrice:
 *                       type: number
 *                       example: 22000
 *                     total:
 *                       type: number
 *                       example: 44000
 *
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Usuario no autenticado
 *       409:
 *         description: Uno o más asientos no pueden ser bloqueados
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
 *                   example: El asiento 15 ya está reservado
 *
 */
router.post("/lock-seats", authenticate, lockSeats);

/**
 * @swagger
 * /api/v1/reservations/release-seats:
 *   delete:
 *     summary: Liberar asientos bloqueados
 *     tags:
 *       - Reservations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - functionId
 *               - seatIds
 *             properties:
 *               functionId:
 *                 type: integer
 *                 example: 1
 *               seatIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *     responses:
 *       200:
 *         description: Asientos liberados
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error interno
 */
router.delete("/release-seats", authenticate, releaseSeats);

/**
 * @swagger
 * /api/v1/reservations/summary:
 *   get:
 *     summary: Obtener resumen de disponibilidad
 *     tags:
 *       - Reservations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: functionId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Resumen de la función
 *       400:
 *         description: functionId inválido
 *       401:
 *         description: Usuario no autenticado
 *       404:
 *         description: Función no encontrada
 */
router.get("/summary", authenticate, getReservationSummary);

export default router;