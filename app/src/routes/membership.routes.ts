
import { Router } from "express";
import { createMembership } from "../controllers/membership.controller";
import { authenticate } from "../middlewares/auth";
import { getMembership, getMembershipBenefits, postCalculateMembershipDiscount, getMembershipQr  } from "../controllers/membership.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Membership
 *   description: Consulta de membresía y beneficios (HU-008)
 */

/**
 * @swagger
 * /membership/create:
 *   post:
 *     summary: Crear o recuperar la membresía digital activa del usuario
 *     tags: [Membership]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Membresía digital creada
 *       200:
 *         description: El usuario ya tenía una membresía activa
 *       401:
 *         description: Token de acceso requerido
 */
router.post("/create", authenticate, createMembership);

/**
 * @swagger
 * /api/v1/membership:
 *   get:
 *     summary: Obtiene la membresía del usuario autenticado
 *     tags: [Membership]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Membresía obtenida correctamente
 *       401:
 *         description: Token ausente o inválido
 *       404:
 *         description: El usuario no tiene una membresía asociada
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", authenticate, getMembership);

/**
 * @swagger
 * /api/v1/membership/benefits:
 *   get:
 *     summary: Obtiene los beneficios del nivel de membresía actual
 *     tags: [Membership]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Beneficios obtenidos correctamente
 *       401:
 *         description: Token ausente o inválido
 *       404:
 *         description: El usuario no tiene una membresía asociada
 *       500:
 *         description: Error interno del servidor
 */
router.get("/benefits", authenticate, getMembershipBenefits);


/**
 * @swagger
 * /api/v1/membership/discount/calculate:
 *   post:
 *     summary: Calcula el descuento de boletas/confitería según el nivel de membresía
 *     tags: [Membership]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ticketAmount:
 *                 type: number
 *                 example: 50000
 *               snackAmount:
 *                 type: number
 *                 example: 15000
 *     responses:
 *       200:
 *         description: Descuento calculado correctamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token ausente o inválido
 *       404:
 *         description: El usuario no tiene una membresía asociada
 *       500:
 *         description: Error interno del servidor
 */
router.post("/discount/calculate", authenticate, postCalculateMembershipDiscount);

/**
 * @swagger
 * /api/v1/membership/qr:
 *   get:
 *     summary: Obtiene el código QR único e intransferible de membresía
 *     tags: [Membership]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Código QR obtenido correctamente
 *       401:
 *         description: Token ausente o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get("/qr", authenticate, getMembershipQr);

export default router;