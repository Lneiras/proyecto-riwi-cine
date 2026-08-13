// app/src/controllers/health.controller.ts

/**
 * Controlador de Salud
 * --------------------
 * HU-001, Escenario 1: `GET /api/v1/health` verifica la conexión a la BD
 * y responde 200 cuando todo está operativo.
 */

import { Request, Response } from "express";
import sequelize from "../config/database";

export const healthCheck = async (_req: Request, res: Response): Promise<Response> => {
  try {
    await sequelize.authenticate();
    return res.status(200).json({
      status: "ok",
      database: "connected",
      uptime: process.uptime(),
    });
  } catch (error: any) {
    return res.status(503).json({
      status: "error",
      database: "disconnected",
      error: error.message,
    });
  }
};
