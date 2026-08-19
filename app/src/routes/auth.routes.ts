// app/src/routes/auth.routes.ts

import { Router } from "express";
import { register, verifyEmail } from "../controllers/auth.controller";
import {
  registerRateLimiter,
  verifyEmailRateLimiter,
} from "../middlewares/rateLimit";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar usuario y crear membresía digital
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
 *                 example: 0x4AAAAAAEVnSekJb5WveOdk
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
 *     summary: Activar cuenta mediante token temporal
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

export default router;
