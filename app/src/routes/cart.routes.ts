import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { applyGiftCard, applyMembership, createCart, deleteCart, getCart, updateCart } from "../controllers/cart.controller";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     CartSummary:
 *       type: object
 *       properties:
 *         ticketSubtotal: { type: number, format: double, example: 44000 }
 *         productSubtotal: { type: number, format: double, example: 0 }
 *         giftCardPurchaseSubtotal: { type: number, format: double, example: 100000 }
 *         subtotal: { type: number, format: double, example: 144000 }
 *         membershipDiscount: { type: number, format: double, example: 4400 }
 *         promotionDiscount: { type: number, format: double, example: 0 }
 *         giftCardDiscount: { type: number, format: double, example: 30000 }
 *         tax: { type: number, format: double, example: 0 }
 *         total: { type: number, format: double, example: 109600 }
 *     Cart:
 *       type: object
 *       properties:
 *         userId: { type: integer, example: 12 }
 *         tickets:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               showtimeId: { type: integer, example: 1 }
 *               movie: { type: string, nullable: true, example: Interstellar }
 *               dateTime: { type: string, format: date-time }
 *               room: { type: string, nullable: true, example: Sala 2 }
 *               format: { type: string, nullable: true, example: 2D }
 *               seat:
 *                 type: object
 *                 properties:
 *                   id: { type: integer, example: 15 }
 *                   row: { type: string, example: A }
 *                   number: { type: integer, example: 5 }
 *                   type: { type: string, example: General }
 *               unitPrice: { type: number, example: 22000 }
 *               total: { type: number, example: 22000 }
 *                 products:
 *                      type: array
 *                      description: Productos de confitería en el carrito, con precio vigente (incluye promociones activas).
 *                      items:
 *                          type: object
 *                          properties:
 *                            productId: { type: integer, example: 4 }
 *                            name: { type: string, example: Combo Grande }
 *                            category: { type: string, nullable: true, example: Combos }
 *                            imageUrl: { type: string, nullable: true }
 *                            quantity: { type: integer, minimum: 1, example: 2 }
 *                            unitPrice: { type: number, example: 18000 }
 *                            total: { type: number, example: 36000 }
 *         giftCardsToPurchase: { type: array, items: { type: object } }
 *         appliedGiftCards: { type: array, items: { type: object } }
 *         membership: { type: object, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         lastActivityAt: { type: string, format: date-time }
 *         expiresAt: { type: string, format: date-time }
 *         summary: { $ref: '#/components/schemas/CartSummary' }
 *     ApiError:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: false }
 *         error:
 *           type: object
 *           properties:
 *             message: { type: string }
 *             code: { type: string }
 */

/**
 * @swagger
 * /api/v1/cart:
 *   post:
 *     summary: Crear o recuperar el carrito activo
 *     description: Operación idempotente. Solo puede existir un carrito activo por usuario y expira después de diez minutos sin actividad.
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Carrito creado o recuperado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Cart' }
 *       401: { description: Usuario no autenticado }
 *   get:
 *     summary: Consultar el carrito activo
 *     description: Reconstruye la información de entradas con los modelos actuales, recalcula los totales y renueva la actividad.
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Carrito activo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Cart' }
 *       401: { description: Usuario no autenticado }
 *       404: { description: No existe un carrito activo }
 *   put:
 *     summary: Modificar entradas o productos del carrito
 *     description: Bloquea las sillas agregadas y libera las eliminadas. Valida stock disponible antes de aceptar productos de confitería.
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               functionId: { type: integer, example: 1 }
 *               addSeatIds: { type: array, items: { type: integer }, example: [10, 11] }
 *               removeSeatIds: { type: array, items: { type: integer }, example: [8] }
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId: { type: integer, example: 4 }
 *                     quantity: { type: integer, minimum: 0, example: 2 }
 *     responses:
 *       200: { description: Carrito actualizado }
 *       400: { description: Datos inválidos }
 *       401: { description: Usuario no autenticado }
 *       404: { description: Carrito, función o producto de confitería inexistente }
 *       409: { description: Una silla no se puede bloquear, o no hay stock suficiente de un producto de confitería }
 *   delete:
 *     summary: Cancelar el carrito activo
 *     description: Elimina el carrito de Redis, libera sus sillas y libera los bloqueos temporales de gift cards.
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Resultado idempotente de la eliminación
 *       401: { description: Usuario no autenticado }
 */
router.post("/", createCart);
router.get("/", getCart);
router.put("/", updateCart);
router.delete("/", deleteCart);

/**
 * @swagger
 * /api/v1/cart/apply-membership:
 *   post:
 *     summary: Aplicar el descuento de membresía
 *     description: Consulta la membresía vigente del usuario y recalcula automáticamente el carrito.
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Membresía aplicada y carrito recalculado }
 *       401: { description: Usuario no autenticado }
 *       404: { description: No existe un carrito activo }
 */
router.post("/apply-membership", applyMembership);

/**
 * @swagger
 * /api/v1/cart/apply-giftcard:
 *   post:
 *     summary: Aplicar una gift card activa al carrito
 *     description: Valida vigencia y saldo, y bloquea temporalmente la tarjeta para este carrito. El saldo se consume al confirmar el pago.
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string, example: CINE-8K7P-X3MN-92QF }
 *     responses:
 *       200: { description: Gift card aplicada y carrito recalculado }
 *       400: { description: Código inválido, tarjeta inactiva o vencida }
 *       401: { description: Usuario no autenticado }
 *       404: { description: No existe un carrito activo }
 *       409: { description: Sin saldo, bloqueada por otro carrito o uso sobre sí misma }
 */
router.post("/apply-giftcard", applyGiftCard);
export default router;
