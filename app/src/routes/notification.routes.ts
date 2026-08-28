// app/src/routes/notification.routes.ts

import { Router } from "express";
import { UpcomingMovieController } from "../controllers/upcoming-movie.controller";
import NotificationController from "../controllers/notification.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

/**
 * @swagger
 * /api/v1/notifications/email:
 *   post:
 *     summary: Enviar notificación por correo electrónico (HU-015 Task 1)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipient, type, subject]
 *             properties:
 *               recipient:
 *                 type: string
 *                 format: email
 *                 example: usuario@correo.com
 *               type:
 *                 type: string
 *                 enum: [account, purchase, reservation, marketing]
 *                 example: purchase
 *               subject:
 *                 type: string
 *                 example: ¡Tu compra en Multicine fue exitosa!
 *               templateData:
 *                 type: object
 *                 example:
 *                   userName: Juan Perez
 *                   orderNumber: ORD-98721
 *                   movieTitle: Spider-Man
 *                   cinemaName: Multicine Mall Plaza
 *                   totalAmount: 32000
 *               customHtml:
 *                 type: string
 *                 description: HTML personalizado opcional
 *     responses:
 *       201:
 *         description: Notificación enviada y registrada en el historial exitosamente
 *       200:
 *         description: Notificación omitida debido a preferencias del usuario (marketing desactivado)
 *       400:
 *         description: Parámetros inválidos o incompletos
 *       500:
 *         description: Error interno del servidor
 */
router.post("/email", authenticate, NotificationController.sendEmail);

/**
 * @swagger
 * /api/v1/notifications/history:
 *   get:
 *     summary: Obtener historial de notificaciones del usuario (HU-015 Task 1)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, sent, failed]
 *         description: Filtrar por estado de entrega
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [account, purchase, reservation, marketing]
 *         description: Filtrar por tipo de notificación
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de registros por página
 *     responses:
 *       200:
 *         description: Lista paginada del historial de notificaciones
 *       401:
 *         description: Token de autenticación requerido o inválido
 */
router.get("/history", authenticate, NotificationController.getHistory);

/**
 * @swagger
 * /api/v1/notifications/preferences:
 *   get:
 *     summary: Obtener preferencias de notificación del usuario autenticado
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferencias de notificación del usuario
 *       401:
 *         description: Token de autenticación requerido o inválido
 */
router.get("/preferences", authenticate, NotificationController.getPreferences);

/**
 * @swagger
 * /api/v1/notifications/preferences:
 *   put:
 *     summary: Actualizar preferencias de notificación del usuario (HU-015 Task 1)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailEnabled:
 *                 type: boolean
 *                 example: true
 *               smsEnabled:
 *                 type: boolean
 *                 example: false
 *               commercialEnabled:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Preferencias actualizadas correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token de autenticación requerido o inválido
 */
router.put(
  "/preferences",
  authenticate,
  NotificationController.updatePreferences
);

/**
 * @swagger
 * /api/v1/notifications/resend:
 *   post:
 *     summary: Reenviar una notificación registrada en el historial (HU-015 Task 1)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [notificationId]
 *             properties:
 *               notificationId:
 *                 type: integer
 *                 description: ID de la notificación a reenviar
 *                 example: 12
 *     responses:
 *       200:
 *         description: Notificación reenviada y actualizada en el historial
 *       400:
 *         description: ID de notificación inválido
 *       401:
 *         description: Token de autenticación requerido
 *       404:
 *         description: Notificación no encontrada
 */
router.post("/resend", authenticate, NotificationController.resend);

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
 *       400:
 *         description: movieId faltante o inválido
 *       401:
 *         description: Token de acceso requerido o inválido
 *       404:
 *         description: Película no encontrada o no es un próximo estreno
 *       409:
 *         description: El usuario ya está suscrito a este estreno (Escenario 3)
 */
router.post("/upcoming", authenticate, UpcomingMovieController.subscribe);

export default router;
