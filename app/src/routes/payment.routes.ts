import { Router } from "express";

import {
  authenticate,
} from "../middlewares/auth";

import {
  createPayment,
  createPaymentFromCart,
  getPaymentStatus,
  paymentWebhook,
} from "../controllers/payment.controller";

import {
  payGiftCard,
  giftCardPaymentWebhook,
  getGiftCardPaymentStatus,
} from "../controllers/gift-card-payment.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/payments/cart:
 *   post:
 *     summary: Pagar el carrito actual
 *     description: Utiliza la reserva creada mediante checkout y cobra el total calculado incluyendo IVA.
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationId
 *               - paymentMethod
 *               - paymentToken
 *             properties:
 *               reservationId:
 *                 type: integer
 *                 example: 15
 *               paymentMethod:
 *                 type: string
 *                 enum:
 *                   - card
 *                   - pse
 *                   - nequi
 *                   - daviplata
 *                 example: card
 *               paymentToken:
 *                 type: string
 *                 example: approved
 *     responses:
 *       200:
 *         description: Pago procesado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Usuario no autenticado
 *       409:
 *         description: El carrito o sus asientos ya no son válidos
 */
router.post(
  "/cart",
  authenticate,
  createPaymentFromCart
);

/**
 * @swagger
 * /api/v1/payments:
 *   post:
 *     summary: Iniciar el pago de una reserva
 *     description: |
 *       Inicia el proceso de pago de una reserva que fue creada mediante
 *       POST /api/v1/orders.
 *
 *       El usuario se obtiene desde el JWT.
 *
 *       Antes de llamar a la pasarela, el sistema verifica que:
 *       - La reserva pertenezca al usuario autenticado.
 *       - La reserva esté en estado Pendiente.
 *       - La reserva tenga entradas.
 *       - Los bloqueos de los asientos sigan activos.
 *       - Los bloqueos no hayan expirado.
 *
 *       El monto que se envía a la pasarela se obtiene directamente de la
 *       reserva. El cliente NO puede enviar ni modificar el monto del pago.
 *
 *       Actualmente el proyecto utiliza una pasarela MOCK para poder probar
 *       el flujo completo antes de integrar una pasarela real.
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationId
 *               - paymentMethod
 *               - paymentToken
 *             properties:
 *               reservationId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID de la reserva creada mediante POST /api/v1/orders.
 *                 example: 1
 *
 *               paymentMethod:
 *                 type: string
 *                 enum:
 *                   - card
 *                   - pse
 *                   - nequi
 *                   - daviplata
 *                 description: Medio de pago soportado por la pasarela.
 *                 example: card
 *
 *               paymentToken:
 *                 type: string
 *                 description: Token de pago. Nunca se envían datos reales de tarjeta al backend.
 *                 example: test-token
 *
 *           example:
 *             reservationId: 1
 *             paymentMethod: card
 *             paymentToken: test-token
 *
 *     responses:
 *       200:
 *         description: Pago procesado o enviado a la pasarela correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 reservationId: 1
 *                 transactionReference: MOCK-123456
 *                 status: approved
 *                 amount: 43500
 *                 message: Pago autorizado. La compra se confirmará al procesar el webhook.
 *
 *       400:
 *         description: Datos inválidos, reserva inválida, reserva no pendiente o error durante el proceso de pago.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error:
 *                 message: paymentMethod debe ser card, pse, nequi o daviplata.
 *                 code: VALIDATION_ERROR
 *
 *       401:
 *         description: Usuario no autenticado.
 *
 *       404:
 *         description: Reserva no encontrada.
 *
 *       409:
 *         description: |
 *           Uno o más asientos expiraron antes de realizar el pago.
 *
 *       500:
 *         description: Error interno del servidor.
 */
router.post(
  "/",
  authenticate,
  createPayment
);


/**
 * @swagger
 * /api/v1/payments/status:
 *   get:
 *     summary: Consultar el estado de un pago
 *     description: |
 *       Consulta el estado de una transacción utilizando su referencia.
 *
 *       El usuario se obtiene desde el JWT y solamente puede consultar pagos
 *       asociados a sus propias reservas.
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: transactionReference
 *         required: true
 *         description: Referencia única generada por la pasarela de pago.
 *         schema:
 *           type: string
 *         example: MOCK-123456
 *
 *     responses:
 *       200:
 *         description: Estado del pago obtenido correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 transactionReference: MOCK-123456
 *                 reservationId: 1
 *                 amount: 43500
 *                 status: Aprobado
 *                 paymentDate: "2026-08-25T23:30:00.000Z"
 *
 *       400:
 *         description: transactionReference no fue enviado o es inválido.
 *
 *       401:
 *         description: Usuario no autenticado.
 *
 *       404:
 *         description: Pago no encontrado.
 *
 *       500:
 *         description: Error interno del servidor.
 */
router.get(
  "/status",
  authenticate,
  getPaymentStatus
);


/**
 * @swagger
 * /api/v1/payments/webhook:
 *   post:
 *     summary: Procesar webhook de confirmación de pago
 *     description: |
 *       Recibe la notificación de la pasarela de pago.
 *
 *       El webhook utiliza la referencia única de la transacción para
 *       identificar el pago.
 *
 *       Cuando el pago es aprobado, el sistema confirma la reserva dentro
 *       de una transacción de Sequelize, crea las entradas, descuenta el
 *       inventario, confirma los bloqueos de los asientos, cambia la reserva
 *       a Pagada y registra la auditoría.
 *
 *       Si el mismo webhook aprobado llega nuevamente, el procesamiento es
 *       idempotente y no genera una segunda venta ni entradas duplicadas.
 *
 *       Si el webhook informa un rechazo, el pago se marca como rechazado
 *       y las sillas de la reserva son liberadas.
 *
 *       Este endpoint NO requiere JWT porque es llamado por la pasarela.
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionReference
 *               - status
 *             properties:
 *               transactionReference:
 *                 type: string
 *                 description: Referencia única de la transacción generada por la pasarela.
 *                 example: MOCK-123456
 *
 *               status:
 *                 type: string
 *                 enum:
 *                   - approved
 *                   - rejected
 *                 description: Resultado informado por la pasarela.
 *                 example: approved
 *
 *           examples:
 *             approved:
 *               summary: Pago aprobado
 *               value:
 *                 transactionReference: MOCK-123456
 *                 status: approved
 *
 *             rejected:
 *               summary: Pago rechazado
 *               value:
 *                 transactionReference: MOCK-123456
 *                 status: rejected
 *
 *     responses:
 *       200:
 *         description: Webhook procesado correctamente.
 *         content:
 *           application/json:
 *             examples:
 *               approved:
 *                 summary: Pago confirmado
 *                 value:
 *                   success: true
 *                   data:
 *                     idempotent: false
 *                     reservationId: 1
 *                     status: approved
 *
 *               duplicate:
 *                 summary: Webhook duplicado
 *                 value:
 *                   success: true
 *                   data:
 *                     idempotent: true
 *                     reservationId: 1
 *                     transactionReference: MOCK-123456
 *
 *               rejected:
 *                 summary: Pago rechazado
 *                 value:
 *                   success: true
 *                   data:
 *                     idempotent: false
 *                     reservationId: 1
 *                     status: rejected
 *
 *       400:
 *         description: transactionReference o status inválidos.
 *
 *       404:
 *         description: Transacción o reserva asociada no encontrada.
 *
 *       500:
 *         description: Error interno del servidor.
 */
router.post(
  "/webhook",
  paymentWebhook
);

/**
 * @swagger
 * /api/v1/payments/gift-card:
 *   post:
 *     summary: Pagar una Gift Card
 *     description: |
 *       Inicia el pago de una Gift Card independiente de cualquier reserva.
 *
 *       El valor de la Gift Card no se toma del cliente.
 *       Se obtiene desde PostgreSQL.
 *
 *       El sistema calcula el IVA utilizando CART_TAX_PERCENT.
 *
 *       Ejemplo:
 *       Gift Card: $100.000
 *       IVA 19%:    $19.000
 *       Total:     $119.000
 *
 *       Actualmente se utiliza MockPaymentGateway en lugar
 *       de una pasarela real.
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - giftCardId
 *               - paymentMethod
 *               - paymentToken
 *             properties:
 *               giftCardId:
 *                 type: integer
 *                 example: 1
 *               paymentMethod:
 *                 type: string
 *                 enum:
 *                   - card
 *                   - pse
 *                   - nequi
 *                   - daviplata
 *                 example: card
 *               paymentToken:
 *                 type: string
 *                 description: |
 *                   Token de prueba.
 *                   Usa "approved" para aprobar,
 *                   "reject" para rechazar
 *                   o "timeout" para simular timeout.
 *                 example: approved
 *     responses:
 *       200:
 *         description: Pago enviado a la pasarela.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: Gift Card no encontrada.
 *       409:
 *         description: Gift Card no disponible para pago.
 */
router.post(
  "/gift-card",
  authenticate,
  payGiftCard
);

/**
 * @swagger
 * /api/v1/payments/gift-card/status:
 *   get:
 *     summary: Consultar estado del pago de una Gift Card
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: transactionReference
 *         required: true
 *         schema:
 *           type: string
 *         example: MOCK-123456
 *     responses:
 *       200:
 *         description: Estado consultado correctamente.
 *       404:
 *         description: Pago no encontrado.
 */
router.get(
  "/gift-card/status",
  authenticate,
  getGiftCardPaymentStatus
);

/**
 * @swagger
 * /api/v1/payments/gift-card/webhook:
 *   post:
 *     summary: Confirmar pago de Gift Card
 *     description: |
 *       Webhook utilizado por la pasarela para confirmar el pago.
 *
 *       Cuando el pago es aprobado:
 *       1. La Gift Card pasa a active.
 *       2. Se asigna su código.
 *       3. Se asigna el saldo disponible.
 *       4. Se registra la transacción.
 *       5. Se envía el código al destinatario.
 *
 *       Este endpoint no requiere JWT.
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionReference
 *               - status
 *             properties:
 *               transactionReference:
 *                 type: string
 *                 example: MOCK-123456
 *               status:
 *                 type: string
 *                 enum:
 *                   - approved
 *                   - rejected
 *                 example: approved
 *     responses:
 *       200:
 *         description: Webhook procesado.
 *       400:
 *         description: Datos inválidos.
 *       404:
 *         description: Pago no encontrado.
 */
router.post(
  "/gift-card/webhook",
  giftCardPaymentWebhook
);

export default router;