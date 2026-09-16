// app/src/routes/auth.routes.ts

/**
 * Rutas de Autenticación
 * ----------------------
 * Endpoints exclusivos de autenticación y gestión de sesión (HU-006/HU-007).
 * Se mantienen separados de las rutas de usuarios.
 *
 * Endpoints disponibles:
 *  - `POST /auth/register`         : Registro público y membresía digital (HU-006).
 *  - `POST /auth/verify-email`     : Activar cuenta con token temporal (HU-006).
 *  - `GET  /auth/verify-email`     : Enlace clickeable del correo (HU-006).
 *  - `POST /auth/login`            : Inicio de sesión seguro (HU-007).
 *  - `POST /auth/logout`           : Cerrar sesión revocando el refresh token (HU-007).
 *  - `POST /auth/forgot-password`  : Solicitar recuperación de contraseña (HU-007).
 *  - `POST /auth/reset-password`   : Restablecer contraseña con token (HU-007).
 *  - `POST /auth/refresh`          : Renovar tokens mediante refresh token (HU-007).
 */

import { Router } from "express";
import { register, verifyEmail } from "../controllers/auth.controller";
import { Auth, refreshTokens, logout, forgotPassword, resetPassword } from "../controllers/user.controller";
import {
  registerRateLimiter,
  verifyEmailRateLimiter,
  loginRateLimiter,
} from "../middlewares/rateLimit";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar usuario y crear membresía digital (HU-006)
 *     tags: [Auth]
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
 *                 description: Token generado por Cloudflare Turnstile
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
router.post("/register", registerRateLimiter, register);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Activar cuenta mediante token temporal (HU-006)
 *     tags: [Auth]
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
router.post("/verify-email", verifyEmailRateLimiter, verifyEmail);

// Ruta auxiliar para que el enlace enviado por correo sea clickeable directamente.
router.get("/verify-email", verifyEmailRateLimiter, verifyEmail);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicio de sesión seguro (HU-007)
 *     description: >
 *       Emite Access Token (15 min) y Refresh Token (7 días). Invalida el refresh token
 *       anterior. Bloquea la cuenta por 15 minutos tras 5 intentos fallidos consecutivos.
 *       Rechaza cuentas con correo sin verificar.
 *     tags: [Auth]
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
router.post("/login", loginRateLimiter, Auth);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión revocando el refresh token (HU-007)
 *     tags: [Auth]
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
router.post("/logout", logout);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña (HU-007)
 *     description: Envía un enlace con token temporal (30 min) si el correo está registrado. La respuesta siempre es genérica.
 *     tags: [Auth]
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
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con token temporal (HU-007)
 *     description: Revoca todas las sesiones activas del usuario tras el cambio.
 *     tags: [Auth]
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
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar tokens de acceso mediante refresh token (HU-007 Escenario 4)
 *     tags: [Auth]
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

export default router;
