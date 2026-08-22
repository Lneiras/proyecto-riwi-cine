// app/src/routes/membership.routes.ts

import { Router } from "express";
import { createMembership } from "../controllers/membership.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

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

export default router;
