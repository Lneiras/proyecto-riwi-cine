// app/src/middlewares/rateLimit.ts

import { NextFunction, Request, Response } from "express";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Rate limiter en memoria para endpoints sensibles.
 * Es suficiente para la instancia actual del backend y no agrega dependencias.
 * Si la API se escala a varias instancias, deberá reemplazarse por un almacén compartido.
 */
function createRateLimiter(windowMs: number, maxRequests: number) {
  const requests = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const current = requests.get(key);

    if (!current || current.resetAt <= now) {
      requests.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (current.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds.toString());
      res.status(429).json({
        error: "Demasiados intentos. Intenta nuevamente más tarde.",
        code: "RATE_LIMIT_EXCEEDED",
      });
      return;
    }

    current.count += 1;
    requests.set(key, current);
    next();
  };
}

// Registro: evita creación automatizada masiva de cuentas.
export const registerRateLimiter = createRateLimiter(15 * 60 * 1000, 5);

// Verificación: permite algunos reintentos sin aceptar abuso del endpoint.
export const verifyEmailRateLimiter = createRateLimiter(15 * 60 * 1000, 10);

// Login: protección contra intentos repetidos de contraseña.
export const loginRateLimiter = createRateLimiter(15 * 60 * 1000, 5);
