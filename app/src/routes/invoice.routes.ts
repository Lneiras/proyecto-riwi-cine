import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { getInvoiceById } from "../controllers/invoice.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/invoice/{id}:
 *   get:
 *     summary: Obtener factura electrónica por id
 *     tags: [Invoices]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Factura encontrada }
 *       401: { description: Usuario no autenticado }
 *       403: { description: La factura no pertenece al usuario }
 *       404: { description: Factura no encontrada }
 */
router.get("/:id", authenticate, getInvoiceById);

export default router;