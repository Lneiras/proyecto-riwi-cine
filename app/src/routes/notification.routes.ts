// app/src/routes/notification.routes.ts

import { Router } from "express";
import { UpcomingMovieController } from "../controllers/upcoming-movie.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

/**
 * @swagger
 * /api/v1/notifications/upcoming:
 *   post:
 *     summary: Suscribirse a la notificación de un próximo estreno (HU-005 Escenarios 2 y 3)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [movieId]
 *             properties:
 *               movieId:
 *                 type: integer
 *                 description: ID de la película en estado "proximo_estreno"
 *           example:
 *             movieId: 6
 *     responses:
 *       201:
 *         description: Suscripción registrada correctamente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 4
 *                 userId: 1
 *                 movieId: 6
 *                 notifiedAt: null
 *                 createdAt: "2026-08-13T03:30:00.000Z"
 *       400:
 *         description: movieId faltante o inválido
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Película no encontrada o no es un próximo estreno
 *       409:
 *         description: El usuario ya está suscrito a este estreno (Escenario 3)
 *         content:
 *           application/json:
 *             example:
 *               error: "Ya estás suscrito para recibir la notificación de este estreno"
 */
router.post("/upcoming", authenticate, UpcomingMovieController.subscribe);

export default router;
