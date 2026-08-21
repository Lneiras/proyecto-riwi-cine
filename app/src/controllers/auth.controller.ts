// app/src/controllers/auth.controller.ts

import { NextFunction, Request, Response } from "express";
import AuthService from "../services/auth.service";
import { RegisterUserDto } from "../dto/register-user.dto";
import { successResponse } from "../utils/apiResponse";

/**
 * Registro público HU-006.
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const data = req.body as RegisterUserDto;
    const result = await AuthService.register(data, req.ip);

    return successResponse(
      res,
      {
        user: result.user,
        membership: result.membership,
        activationExpiresAt: result.activationExpiresAt,
        message: "Registro exitoso. Revisa tu correo para activar la cuenta.",
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Verifica el token enviado por correo. Soporta POST (contrato HU-006)
 * y GET para que el enlace recibido por email funcione directamente.
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const bodyToken = typeof req.body?.token === "string" ? req.body.token : undefined;
    const queryToken = typeof req.query.token === "string" ? req.query.token : undefined;
    const token = bodyToken || queryToken || "";

    const user = await AuthService.verifyEmail(token);

    return successResponse(res, {
      user,
      message: "Cuenta activada correctamente.",
    });
  } catch (error) {
    next(error);
  }
};
