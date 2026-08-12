

/**
 * Estándar de respuesta JSON del proyecto Multicine
 * ----------------------------------------------------
 * Éxito:  { success: true, data: <payload>, meta?: {...} }
 * Error:  { success: false, error: { message, code } }
 *
 * `meta` se usa para paginación, conteos, etc.
 */

import { Response } from "express";

export function successResponse(res: Response, data: unknown, status = 200, meta?: Record<string, unknown>) {
  return res.status(status).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

/**
 * Error controlado (validación, 404, etc.) — se lanza y lo captura
 */
export class AppError extends Error {
  public status: number;
  public code: string;

  constructor(message: string, status = 400, code = "BAD_REQUEST") {
    super(message);
    this.status = status;
    this.code = code;
  }
}