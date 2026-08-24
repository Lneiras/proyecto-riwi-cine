
import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { getProfile, updateProfile } from "../controllers/user.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente
 *       401:
 *         description: Token ausente o inválido
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", authenticate, getProfile);

/**
 * @swagger
 * /api/v1/profile:
 *   put:
 *     summary: Actualiza el perfil del usuario autenticado
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Laura Gómez"
 *               lastName:
 *                 type: string
 *                 example: Hernández
 *               email:
 *                 type: string
 *                 format: email
 *                 example: francisco@example.com
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token ausente o inválido
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put("/", authenticate, updateProfile);

export default router;