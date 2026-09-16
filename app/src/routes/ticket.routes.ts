import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import {
  generateTickets,
  getMyTickets,
  getTicketById,
  downloadTicketPdf,
  regenerateTicket,
} from "../controllers/ticket.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/tickets/generate:
 *   post:
 *     summary: (Temporal) Genera entradas + factura a partir de reservationEntryIds ya pagados
 *     description: Puente mientras HU-013 (pago) no está integrado.
 *     tags: [Tickets]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reservationEntryIds]
 *             properties:
 *               reservationEntryIds:
 *                 type: array
 *                 items: { type: integer }
 *                 example: [1, 2]
 *     responses:
 *       201: { description: Entradas y factura generadas }
 *       400: { description: Datos inválidos }
 *       401: { description: Usuario no autenticado }
 *       404: { description: Entradas no encontradas }
 *       409: { description: Ya existen entradas para esas reservas }
 */
router.post("/generate", authenticate, generateTickets);

/**
 * @swagger
 * /api/v1/tickets:
 *   get:
 *     summary: Listar mis entradas digitales
 *     tags: [Tickets]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de entradas del usuario }
 *       401: { description: Usuario no autenticado }
 */
router.get("/", authenticate, getMyTickets);

/**
 * @swagger
 * /api/v1/tickets/{id}:
 *   get:
 *     summary: Detalle de una entrada digital
 *     tags: [Tickets]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Detalle de la entrada }
 *       401: { description: Usuario no autenticado }
 *       403: { description: La entrada no pertenece al usuario }
 *       404: { description: Entrada no encontrada }
 */
router.get("/:id", authenticate, getTicketById);

/**
 * @swagger
 * /api/v1/tickets/{id}/pdf:
 *   get:
 *     summary: Descargar el PDF de una entrada (RN-059 - se puede volver a descargar)
 *     tags: [Tickets]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Archivo PDF
 *         content:
 *           application/pdf:
 *             schema: { type: string, format: binary }
 *       401: { description: Usuario no autenticado }
 *       403: { description: La entrada no pertenece al usuario }
 *       404: { description: Entrada no encontrada }
 */
router.get("/:id/pdf", authenticate, downloadTicketPdf);

/**
 * @swagger
 * /api/v1/tickets/regenerate:
 *   post:
 *     summary: Regenerar el QR de una entrada (RN-057)
 *     tags: [Tickets]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ticketId]
 *             properties:
 *               ticketId: { type: integer, example: 5 }
 *     responses:
 *       200: { description: Entrada regenerada }
 *       401: { description: Usuario no autenticado }
 *       403: { description: La entrada no pertenece al usuario }
 *       404: { description: Entrada no encontrada }
 *       409: { description: La entrada ya fue utilizada }
 */
router.post("/regenerate", authenticate, regenerateTicket);

export default router;