import {
  Router,
} from "express";

import {
  authenticate,
} from "../middlewares/auth";

import {
  checkout,
} from "../controllers/checkout.controller";

const router =
  Router();


/**
 * @swagger
 * /api/v1/checkout:
 *   post:
 *     summary: Convertir el carrito actual en una reserva pendiente
 *     tags:
 *       - Checkout
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Checkout creado correctamente
 *       400:
 *         description: El carrito está vacío o contiene datos inválidos
 *       401:
 *         description: Usuario no autenticado
 *       404:
 *         description: Recurso no encontrado
 *       409:
 *         description: Un asiento ya no está bloqueado o el checkout ya inició
 */

router.post("/",authenticate,checkout);


export default router;