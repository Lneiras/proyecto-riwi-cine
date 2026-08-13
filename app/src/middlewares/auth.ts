// app/src/middlewares/auth.ts

/**
 * Middleware de Autenticación (JWT)
 * ---------------------------------
 * Valida el header `Authorization: Bearer <token>` y expone el usuario
 * autenticado en `req.userId` / `req.userRoleId`.
 */

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRoleId?: number;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token de acceso requerido" });
    return;
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = verifyToken(token);
    if (typeof payload.sub !== "number") {
      res.status(401).json({ error: "Token inválido" });
      return;
    }

    req.userId = payload.sub;
    req.userRoleId = (payload as { roleId?: number }).roleId;

    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}
