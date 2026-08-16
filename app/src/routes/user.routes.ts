// app/src/routes/user.routes.ts

/**
 * Rutas de Usuario
 * ----------------
 * Este archivo define las rutas HTTP relacionadas con la entidad `User`.
 *
 * Endpoints disponibles:
 *  - `POST /users/`          : Crear un nuevo usuario.
 *  - `GET /users/`           : Obtener todos los usuarios registrados.
 *  - `POST /users/auth`      : Iniciar sesión (emite access + refresh token).
 *  - `POST /users/refresh`   : Renovar tokens mediante refresh token.
 *  - `PATCH /users/location` : Cambiar la ciudad del usuario autenticado.
 *  - `GET /users/{id}`       : Obtener un usuario por ID.
 *
 * Cada ruta se conecta con su respectivo controlador.
 */

import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { loginRateLimiter } from "../middlewares/rateLimit";
import {
  createUser,
  getUsers,
  Auth,
  refreshTokens,
  changeUserLocation,
  getUsersbyId,
} from "../controllers/user.controller";

const router = Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.post("/", createUser);

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
 * /api/users/auth:
 *   post:
 *     summary: Autenticación de usuario (emite tokens JWT)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Usuario autenticado con accessToken y refreshToken
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */
router.post("/auth", loginRateLimiter, Auth);

/**
 * @swagger
 * /api/users/refresh:
 *   post:
 *     summary: Renovar tokens de acceso mediante refresh token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "..."
 *     responses:
 *       200:
 *         description: Nuevos accessToken y refreshToken emitidos
 *       401:
 *         description: Token de refresco inválido o expirado
 */
router.post("/refresh", refreshTokens);

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
