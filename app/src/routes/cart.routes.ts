import {
  Router,
} from "express";


import {
  authenticate,
} from "../middlewares/auth";


import {
  createCart,
  getCart,
  updateCart,
  deleteCart,
  applyMembership,
  applyGiftCard,
  removeGiftCard,
} from "../controllers/cart.controller";


const router =
  Router();


router.use(
  authenticate
);


/**
 * @swagger
 * /api/v1/cart:
 *   post:
 *     summary: Crear o recuperar el carrito
 *     description: |
 *       Crea el carrito del usuario autenticado si no existe.
 *       Si ya existe, devuelve el carrito actual.
 *
 *       El carrito puede contener:
 *       - Entradas.
 *       - Productos.
 *       - Gift Cards que se están comprando.
 *       - Gift Cards aplicadas como medio de pago.
 *
 *       El resumen incluye:
 *       - Subtotal.
 *       - Descuentos.
 *       - IVA.
 *       - Total.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito creado o recuperado correctamente.
 *       401:
 *         description: Usuario no autenticado.
 */
router.post(
  "/",
  createCart
);


/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Consultar el carrito
 *     description: |
 *       Obtiene el carrito actual del usuario autenticado.
 *
 *       El servidor recalcula los precios utilizando los precios
 *       actuales almacenados en PostgreSQL.
 *
 *       El resumen incluye el IVA configurado en
 *       CART_TAX_PERCENT.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito obtenido correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 userId: 1
 *                 tickets: []
 *                 products:
 *                   - productId: 1
 *                     name: "Crispetas"
 *                     quantity: 2
 *                     unitPrice: 12000
 *                     subtotal: 24000
 *                     availableStock: 20
 *                 giftCardsToPurchase: []
 *                 appliedGiftCards:
 *                   - giftCardId: 1
 *                     amount: 50000
 *                 membershipApplied: true
 *                 checkoutReservationId: null
 *                 summary:
 *                   ticketSubtotal: 20000
 *                   productSubtotal: 24000
 *                   giftCardPurchaseSubtotal: 0
 *                   subtotal: 44000
 *                   membershipDiscount: 0
 *                   promotionDiscount: 0
 *                   taxableSubtotal: 44000
 *                   taxPercent: 19
 *                   tax: 8360
 *                   beforeGiftCards: 52360
 *                   giftCardDiscount: 50000
 *                   total: 2360
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: No existe un carrito activo.
 */
router.get(
  "/",
  getCart
);


/**
 * @swagger
 * /api/v1/cart:
 *   put:
 *     summary: Modificar el carrito
 *     description: |
 *       Modifica las entradas y/o productos del carrito.
 *
 *       Las Gift Cards aplicadas NO se modifican mediante este endpoint.
 *       Para eso se utilizan:
 *
 *       POST /api/v1/cart/apply-gift-card
 *
 *       POST /api/v1/cart/remove-gift-card
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               functionId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID de la función. Obligatorio al modificar asientos.
 *                 example: 1
 *
 *               addSeatIds:
 *                 type: array
 *                 description: IDs de asientos que se desean agregar.
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                 example:
 *                   - 1
 *                   - 2
 *
 *               removeSeatIds:
 *                 type: array
 *                 description: IDs de asientos que se desean retirar.
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                 example:
 *                   - 2
 *
 *               addProducts:
 *                 type: array
 *                 description: Productos que se desean agregar.
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 2
 *
 *               updateProducts:
 *                 type: array
 *                 description: Reemplaza la cantidad de un producto.
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 3
 *
 *               removeProductIds:
 *                 type: array
 *                 description: IDs de productos que se desean eliminar.
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                 example:
 *                   - 2
 *
 *           examples:
 *             agregarProductos:
 *               summary: Agregar productos
 *               value:
 *                 addProducts:
 *                   - productId: 1
 *                     quantity: 2
 *
 *             actualizarProducto:
 *               summary: Actualizar cantidad
 *               value:
 *                 updateProducts:
 *                   - productId: 1
 *                     quantity: 3
 *
 *             eliminarProducto:
 *               summary: Eliminar producto
 *               value:
 *                 removeProductIds:
 *                   - 1
 *
 *             entradasYProductos:
 *               summary: Agregar entradas y productos
 *               value:
 *                 functionId: 1
 *                 addSeatIds:
 *                   - 1
 *                   - 2
 *                 addProducts:
 *                   - productId: 1
 *                     quantity: 2
 *
 *     responses:
 *       200:
 *         description: Carrito actualizado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: Recurso no encontrado.
 *       409:
 *         description: Conflicto de negocio.
 */
router.put(
  "/",
  updateCart
);


/**
 * @swagger
 * /api/v1/cart:
 *   delete:
 *     summary: Eliminar el carrito
 *     description: |
 *       Elimina el carrito activo del usuario.
 *
 *       Si existen asientos bloqueados asociados al carrito,
 *       los bloqueos son liberados.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito eliminado correctamente.
 *         content:
 *           application/json:
 *             examples:
 *               deleted:
 *                 value:
 *                   success: true
 *                   data:
 *                     deleted: true
 *
 *               notFound:
 *                 value:
 *                   success: true
 *                   data:
 *                     deleted: false
 *       401:
 *         description: Usuario no autenticado.
 *       409:
 *         description: El carrito está en proceso de checkout.
 */
router.delete(
  "/",
  deleteCart
);


/**
 * @swagger
 * /api/v1/cart/apply-membership:
 *   post:
 *     summary: Aplicar descuento de membresía
 *     description: |
 *       Activa el descuento de membresía para el carrito.
 *
 *       Después de aplicar el descuento se recalcula el IVA
 *       y el total.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Membresía aplicada correctamente.
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: No existe un carrito activo.
 *       409:
 *         description: El carrito está en proceso de checkout.
 */
router.post(
  "/apply-membership",
  applyMembership
);


/**
 * @swagger
 * /api/v1/cart/apply-gift-card:
 *   post:
 *     summary: Aplicar una Gift Card al carrito
 *     description: |
 *       Aplica una Gift Card activa al carrito del usuario.
 *
 *       El código se busca mediante su hash en PostgreSQL.
 *
 *       La Gift Card debe:
 *       - Existir.
 *       - Estar activa.
 *       - No estar vencida.
 *       - Tener saldo disponible.
 *
 *       El servidor calcula automáticamente cuánto puede descontar
 *       del total.
 *
 *       El usuario NO envía el valor del descuento.
 *       El valor se obtiene desde el saldo disponible de la Gift Card.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: Código completo de la Gift Card.
 *                 example: CINE-A1B2-C3D4-E5F6-7890
 *
 *     responses:
 *       200:
 *         description: Gift Card aplicada correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 userId: 1
 *                 tickets: []
 *                 products:
 *                   - productId: 1
 *                     name: "Crispetas"
 *                     quantity: 2
 *                     unitPrice: 12000
 *                     subtotal: 24000
 *                     availableStock: 20
 *                 giftCardsToPurchase: []
 *                 appliedGiftCards:
 *                   - giftCardId: 1
 *                     amount: 50000
 *                 membershipApplied: true
 *                 checkoutReservationId: null
 *                 summary:
 *                   ticketSubtotal: 0
 *                   productSubtotal: 24000
 *                   giftCardPurchaseSubtotal: 0
 *                   subtotal: 24000
 *                   membershipDiscount: 0
 *                   promotionDiscount: 0
 *                   taxableSubtotal: 24000
 *                   taxPercent: 19
 *                   tax: 4560
 *                   beforeGiftCards: 28560
 *                   giftCardDiscount: 28560
 *                   total: 0
 *
 *       400:
 *         description: Código inválido, Gift Card inactiva o vencida.
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: No existe un carrito activo.
 *       409:
 *         description: La Gift Card no tiene saldo o está siendo utilizada.
 */
router.post(
  "/apply-gift-card",
  applyGiftCard
);


/**
 * @swagger
 * /api/v1/cart/remove-gift-card:
 *   post:
 *     summary: Retirar una Gift Card aplicada
 *     description: |
 *       Retira del carrito una Gift Card que había sido aplicada
 *       como medio de pago.
 *
 *       Retirar la Gift Card vuelve a calcular el total del carrito.
 *     tags:
 *       - Cart
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
 *             properties:
 *               giftCardId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID de la Gift Card aplicada.
 *                 example: 1
 *
 *     responses:
 *       200:
 *         description: Gift Card retirada correctamente.
 *       400:
 *         description: giftCardId inválido.
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: No existe un carrito activo.
 *       409:
 *         description: El carrito está en proceso de checkout.
 */
router.post(
  "/remove-gift-card",
  removeGiftCard
);


export default router;