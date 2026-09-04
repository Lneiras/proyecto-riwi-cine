import {
  Router,
} from "express";

import {
  authenticate,
} from "../middlewares/auth";

import {
  createGiftCard,
  listPurchasedGiftCards,
  getPurchasedGiftCard,
} from "../controllers/gift-card.controller";

const router =
  Router();

router.use(
  authenticate
);

/**
 * @swagger
 * /api/v1/gift-cards:
 *   post:
 *     summary: Crear una Gift Card para comprar
 *     description: |
 *       Crea una Gift Card en estado pending_payment.
 *
 *       IMPORTANTE:
 *       La Gift Card NO se agrega al carrito de entradas.
 *       Su compra es independiente y posteriormente debe pagarse
 *       mediante POST /api/v1/payments/gift-card.
 *
 *       El código de la Gift Card solamente se genera después
 *       de que la pasarela confirme el pago.
 *     tags:
 *       - Gift Cards
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - recipientEmail
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 10000
 *                 maximum: 500000
 *                 example: 100000
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *                 example: destinatario@example.com
 *               recipientName:
 *                 type: string
 *                 example: Laura
 *               senderName:
 *                 type: string
 *                 example: Francisco
 *               message:
 *                 type: string
 *                 maxLength: 500
 *                 example: "¡Disfruta una tarde de cine!"
 *     responses:
 *       201:
 *         description: Gift Card creada y pendiente de pago.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 */
router.post(
  "/",
  createGiftCard
);

/**
 * @swagger
 * /api/v1/gift-cards/purchased:
 *   get:
 *     summary: Listar Gift Cards compradas
 *     tags:
 *       - Gift Cards
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Gift Cards compradas por el usuario.
 *       401:
 *         description: Usuario no autenticado.
 */
router.get(
  "/purchased",
  listPurchasedGiftCards
);

/**
 * @swagger
 * /api/v1/gift-cards/{id}:
 *   get:
 *     summary: Consultar una Gift Card comprada
 *     tags:
 *       - Gift Cards
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Gift Card encontrada.
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: Gift Card no encontrada.
 */
router.get(
  "/:id",
  getPurchasedGiftCard
);

export default router;