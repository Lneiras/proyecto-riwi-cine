import { Router } from "express";

import { authenticate } from "../middlewares/auth";

import {
  createOrder,
} from "../controllers/order.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Crear una orden de compra
 *     description: |
 *       Crea una reserva pendiente de pago utilizando los asientos que
 *       previamente fueron bloqueados por el usuario para una función.
 *
 *       El usuario se obtiene desde el token JWT y no se recibe como parte
 *       del body.
 *
 *       Antes de crear la orden, el sistema valida que:
 *       - La función exista.
 *       - Los asientos pertenezcan a la función.
 *       - Los asientos sigan bloqueados para el usuario autenticado.
 *       - Los bloqueos no hayan expirado.
 *       - Los asientos no hayan sido vendidos previamente.
 *       - Los productos solicitados existan.
 *       - Exista stock suficiente de los productos.
 *
 *       El servicio calcula el valor de las entradas y productos y aplica
 *       el descuento correspondiente a la membresía del usuario mediante
 *       calculate-discount.
 *
 *       La orden se crea con estado "Pendiente". El pago se realiza
 *       posteriormente mediante POST /api/v1/payments.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - showtimeId
 *               - seatIds
 *             properties:
 *               showtimeId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID de la función para la cual están bloqueados los asientos.
 *                 example: 1
 *
 *               seatIds:
 *                 type: array
 *                 minItems: 1
 *                 description: IDs de los asientos previamente bloqueados por el usuario.
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                 example:
 *                   - 1
 *                   - 2
 *
 *               products:
 *                 type: array
 *                 description: Productos de confitería que el usuario desea incluir en la orden.
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       minimum: 1
 *                       description: ID del producto.
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: Cantidad solicitada del producto.
 *                       example: 2
 *                 example:
 *                   - productId: 1
 *                     quantity: 2
 *                   - productId: 2
 *                     quantity: 1
 *
 *           example:
 *             showtimeId: 1
 *             seatIds:
 *               - 1
 *               - 2
 *             products:
 *               - productId: 1
 *                 quantity: 2
 *               - productId: 2
 *                 quantity: 1
 *
 *     responses:
 *       201:
 *         description: Orden creada correctamente y queda pendiente de pago.
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
 *                     reservationId:
 *                       type: integer
 *                       example: 1
 *                     showtimeId:
 *                       type: integer
 *                       example: 1
 *                     seatIds:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example:
 *                         - 1
 *                         - 2
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-08-25T23:00:00.000Z"
 *                     subtotal:
 *                       type: number
 *                       format: double
 *                       example: 50000
 *                     ticketDiscount:
 *                       type: number
 *                       format: double
 *                       example: 5000
 *                     snackDiscount:
 *                       type: number
 *                       format: double
 *                       example: 1500
 *                     discount:
 *                       type: number
 *                       format: double
 *                       example: 6500
 *                     total:
 *                       type: number
 *                       format: double
 *                       example: 43500
 *
 *       400:
 *         description: Datos de la orden inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: showtimeId debe ser un entero mayor que 0.
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *
 *       401:
 *         description: Usuario no autenticado o token inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Sesión requerida.
 *                     code:
 *                       type: string
 *                       example: UNAUTHORIZED
 *
 *       404:
 *         description: La función o el producto solicitado no existe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Función no encontrada
 *                     code:
 *                       type: string
 *                       example: ORDER_ERROR
 *
 *       409:
 *         description: |
 *           Conflicto con la disponibilidad de los asientos o el inventario.
 *           Puede ocurrir cuando los bloqueos expiraron, los asientos ya no
 *           están bloqueados para el usuario o no existe stock suficiente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Uno o más asientos ya no están bloqueados para este usuario o ya expiraron
 *                     code:
 *                       type: string
 *                       example: ORDER_ERROR
 *
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/", authenticate, createOrder);

export default router;