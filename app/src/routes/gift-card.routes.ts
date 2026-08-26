import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { createGiftCard, getPurchasedGiftCard, listPurchasedGiftCards } from "../controllers/gift-card.controller";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     GiftCard:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 20 }
 *         purchaserUserId: { type: integer, example: 12 }
 *         recipientEmail: { type: string, format: email, example: destinatario@example.com }
 *         recipientName: { type: string, nullable: true, example: Laura }
 *         senderName: { type: string, nullable: true, example: Francisco }
 *         message: { type: string, nullable: true, maxLength: 500 }
 *         codeLastFour: { type: string, nullable: true, example: 92QF }
 *         initialBalance: { type: number, format: double, example: 100000 }
 *         availableBalance: { type: number, format: double, example: 100000 }
 *         status:
 *           type: string
 *           enum: [pending_payment, active, redeemed, expired, cancelled]
 *         expiresAt: { type: string, format: date-time, nullable: true }
 *         activatedAt: { type: string, format: date-time, nullable: true }
 *         sentAt: { type: string, format: date-time, nullable: true }
 *       description: El hash y el código completo nunca se exponen en la API.
 */

/**
 * @swagger
 * /api/v1/gift-cards:
 *   post:
 *     summary: Crear una gift card para regalar
 *     description: Crea una tarjeta en estado pending_payment y la agrega al carrito. El código se genera y envía al destinatario únicamente después de confirmar el pago.
 *     tags: [Gift Cards]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, recipientEmail]
 *             properties:
 *               amount: { type: number, minimum: 10000, maximum: 500000, example: 100000 }
 *               recipientEmail: { type: string, format: email, example: destinatario@example.com }
 *               recipientName: { type: string, example: Laura }
 *               senderName: { type: string, example: Francisco }
 *               message: { type: string, maxLength: 500, example: "¡Disfruta una tarde de cine!" }
 *     responses:
 *       201:
 *         description: Gift card pendiente creada y agregada al carrito
 *       400: { description: Valor, correo o mensaje inválido }
 *       401: { description: Usuario no autenticado }
 */
router.post("/", createGiftCard);

/**
 * @swagger
 * /api/v1/gift-cards/purchased:
 *   get:
 *     summary: Listar gift cards compradas por el usuario
 *     tags: [Gift Cards]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Gift cards compradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/GiftCard' }
 *       401: { description: Usuario no autenticado }
 */
router.get("/purchased", listPurchasedGiftCards);

/**
 * @swagger
 * /api/v1/gift-cards/{id}:
 *   get:
 *     summary: Consultar una gift card comprada
 *     description: Solo el usuario comprador puede consultar la tarjeta.
 *     tags: [Gift Cards]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         example: 20
 *     responses:
 *       200:
 *         description: Gift card encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/GiftCard' }
 *       400: { description: ID inválido }
 *       401: { description: Usuario no autenticado }
 *       404: { description: Gift card inexistente o no pertenece al usuario }
 */
router.get("/:id", getPurchasedGiftCard);
export default router;
