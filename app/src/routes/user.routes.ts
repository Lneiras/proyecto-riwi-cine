// app/src/routes/user.routes.ts

/**
 * Rutas de Usuario
 * ----------------
 * Este archivo define las rutas HTTP relacionadas con la entidad `User`.
 * La autenticación vive en `auth.routes.ts` (prefijo `/auth`).
 *
 * Endpoints disponibles:
 *  - `POST /users/`          : Crear un nuevo usuario.
 *  - `GET /users/`           : Obtener todos los usuarios registrados.
 *  - `PATCH /users/location` : Cambiar la ciudad del usuario autenticado.
 *  - `GET /users/{id}`       : Obtener un usuario por ID.
 */

import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import {
  createUser,
  getUsers,
  changeUserLocation,
  getUsersbyId,
} from "../controllers/user.controller";

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", getUsers);

/**
 * @swagger
 * /api/users/location:
 *   patch:
 *     summary: Cambia la ubicación (ciudad) del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location
 *             properties:
 *               location:
 *                 type: string
 *                 description: Nombre de la ciudad
 *                 example: Barranquilla
 *     responses:
 *       200:
 *         description: Ubicación actualizada exitosamente
 *       400:
 *         description: Falta el campo location o no hay sesión activa
 *       401:
 *         description: Token inválido o ausente
 *       404:
 *         description: Ciudad no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.patch("/location", authenticate, changeUserLocation);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a obtener
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", getUsersbyId);

export default router;
