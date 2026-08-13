// app/src/routes/health.routes.ts

/**
 * Rutas de Health Check (HU-001)
 * ------------------------------
 * GET /api/v1/health verifica la conexión a la base de datos.
 */

import { Router } from "express";
import { healthCheck } from "../controllers/health.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check de la API y conexión a la base de datos
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API y base de datos operativas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 database:
 *                   type: string
 *                   example: "connected"
 *                 uptime:
 *                   type: number
 *                   example: 12.34
 *       503:
 *         description: Base de datos no disponible
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 database:
 *                   type: string
 *                   example: "disconnected"
 */
router.get("/", healthCheck);

export default router;
