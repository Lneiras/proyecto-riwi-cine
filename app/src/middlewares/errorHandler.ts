// app/src/middlewares/errorHandler.ts

/**
 * Middleware de Manejo Global de Errores
 * --------------------------------------
 * Se registra al final de la cadena de middlewares en `server.ts`.
 * Recibe cualquier error propagado por los controladores y construye
 * una respuesta HTTP consistente.
 */

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/apiResponse";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    error: err.message || "Error interno del servidor",
  });
}
