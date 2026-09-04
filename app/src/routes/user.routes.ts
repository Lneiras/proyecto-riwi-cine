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
  Auth,
  logout,
  forgotPassword,
  resetPassword,
  refreshTokens,
} from "../controllers/user.controller";
import { loginRateLimiter, registerRateLimiter, verifyEmailRateLimiter } from "../middlewares/rateLimit";
import { register, verifyEmail } from "../controllers/auth.controller";

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

// ============================================================================
// Autenticación (HU-006 registro/activación + HU-007 login seguro)
// ============================================================================

/**
 * @swagger
 * /api/users/auth/register:
 *   post:
 *     summary: Registrar usuario y crear membresía digital (HU-006)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - lastName
 *               - documentType
 *               - documentNumber
 *               - birthDate
 *               - email
 *               - confirmEmail
 *               - phone
 *               - password
 *               - confirmPassword
 *               - cityId
 *               - acceptDataProcessing
 *               - acceptTerms
 *               - captchaToken
 *             properties:
 *               name:
 *                 type: string
 *                 example: Francisco
 *               lastName:
 *                 type: string
 *                 example: Hernández
 *               documentType:
 *                 type: string
 *                 example: CC
 *               documentNumber:
 *                 type: string
 *                 example: "1234567890"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "2002-05-17"
 *               userGenreId:
 *                 type: integer
 *                 nullable: true
 *               email:
 *                 type: string
 *                 format: email
 *                 example: francisco@example.com
 *               confirmEmail:
 *                 type: string
 *                 format: email
 *                 example: francisco@example.com
 *               phone:
 *                 type: string
 *                 example: "+573001234567"
 *               password:
 *                 type: string
 *                 example: "Multicine#2026"
 *               confirmPassword:
 *                 type: string
 *                 example: "Multicine#2026"
 *               cityId:
 *                 type: integer
 *                 example: 1
 *               favoriteCinemaId:
 *                 type: integer
 *                 nullable: true
 *               acceptDataProcessing:
 *                 type: boolean
 *                 example: true
 *               acceptTerms:
 *                 type: boolean
 *                 example: true
 *               acceptCommercialCommunications:
 *                 type: boolean
 *                 example: false
 *               captchaToken:
 *                 type: string
 *                 description: "0x4AAAAAAEVnSUPFjjtKsLG4orWfdyKXFdw"
 *     responses:
 *       201:
 *         description: Usuario y membresía creados; correo de activación procesado
 *       400:
 *         description: Datos inválidos, contraseña débil o CAPTCHA inválido
 *       409:
 *         description: Correo o documento duplicado
 *       429:
 *         description: Demasiados intentos
 */
router.post("/auth/register", registerRateLimiter, register);

/**
 * @swagger
 * /api/users/auth/verify-email:
 *   post:
 *     summary: Activar cuenta mediante token temporal (HU-006)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cuenta activada
 *       400:
 *         description: Token inválido, usado o expirado
 */
router.post("/auth/verify-email", verifyEmailRateLimiter, verifyEmail);

// Ruta auxiliar para que el enlace enviado por correo sea clickeable directamente.
router.get("/auth/verify-email", verifyEmailRateLimiter, verifyEmail);

/**
 * @swagger
 * /api/users/auth/login:
 *   post:
 *     summary: Inicio de sesión seguro (HU-007)
 *     description: >
 *       Emite Access Token (15 min) y Refresh Token (7 días). Invalida el refresh token
 *       anterior. Bloquea la cuenta por 15 minutos tras 5 intentos fallidos consecutivos.
 *       Rechaza cuentas con correo sin verificar.
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
 *                 example: "juan@correo.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Usuario autenticado con accessToken y refreshToken
 *       401:
 *         description: Credenciales inválidas
 *       403:
 *         description: Correo sin verificar
 *       423:
 *         description: Cuenta bloqueada temporalmente
 *       429:
 *         description: Demasiados intentos desde esta IP
 */
router.post("/auth/login", loginRateLimiter, Auth);

// Alias corto del login para compatibilidad con clientes existentes.
/**
 * @swagger
 * /api/users/auth:
 *   post:
 *     summary: Iniciar sesión (alias de /users/auth/login) (HU-007)
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
 *                 example: "juan@correo.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Usuario autenticado con accessToken y refreshToken
 *       401:
 *         description: Credenciales inválidas
 *       403:
 *         description: Correo sin verificar
 *       423:
 *         description: Cuenta bloqueada temporalmente
 */
router.post("/auth", loginRateLimiter, Auth);

/**
 * @swagger
 * /api/users/auth/logout:
 *   post:
 *     summary: Cerrar sesión revocando el refresh token (HU-007)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 *       400:
 *         description: Falta refreshToken
 */
router.post("/auth/logout", logout);

/**
 * @swagger
 * /api/users/auth/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña (HU-007)
 *     description: Envía un enlace con token temporal (30 min) si el correo está registrado. La respuesta siempre es genérica.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@correo.com"
 *     responses:
 *       200:
 *         description: Solicitud procesada
 *       400:
 *         description: Falta el correo electrónico
 */
router.post("/auth/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/users/auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con token temporal (HU-007)
 *     description: Revoca todas las sesiones activas del usuario tras el cambio.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 example: "NuevaClave#2026"
 *     responses:
 *       200:
 *         description: Contraseña restablecida
 *       400:
 *         description: Token inválido/usado/expirado o contraseña débil
 */
router.post("/auth/reset-password", resetPassword);

/**
 * @swagger
 * /api/users/refresh:
 *   post:
 *     summary: Renovar tokens de acceso mediante refresh token (HU-007 Escenario 4)
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
