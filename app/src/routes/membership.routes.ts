// app/src/routes/membership.routes.ts

import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { getMembership, getMembershipBenefits } from "../controllers/membership.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Membership
 *   description: Consulta de membresía y beneficios (HU-008)
 */

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

export default router;