import { Request, Response, NextFunction } from "express";
import userService from "../services/user.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { successResponse } from "../utils/apiResponse";

/**
 * ============================================================================
 * Controlador de Usuarios
 * ============================================================================
 *
 * Este controlador gestiona las solicitudes HTTP relacionadas con la entidad `User`.
 *
 * Su única responsabilidad es actuar como intermediario entre el cliente
 * (HTTP) y la capa de servicios, delegando toda la lógica de negocio al `UserService`.
 *
 * Responsabilidades:
 *  - Recibir y procesar las solicitudes HTTP.
 *  - Obtener la información enviada por el cliente.
 *  - Invocar el servicio correspondiente.
 *  - Construir la respuesta HTTP.
 *  - Retornar los códigos de estado apropiados.
 *
 * Este controlador NO debe:
 *  - Contener reglas de negocio.
 *  - Acceder directamente a la base de datos.
 *  - Ejecutar consultas mediante Sequelize.
 *  - Realizar validaciones complejas del dominio.
 * ============================================================================
 */

/**
 * Crea un nuevo usuario. La contraseña se hashea en el service.
 *
 * @example
 * {
 *   "name": "David Mtz",
 *   "email": "david@example.com",
 *   "password": "password123"
 * }
 *
 * Respuestas:
 * - **201 Created** Usuario creado correctamente.
 * - **500 Internal Server Error** Error inesperado durante el procesamiento.
 */
export const createUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const dto: CreateUserDto = req.body;
    const user = await userService.create(dto);
    return res.status(201).json(user);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Obtiene el listado completo de usuarios.
 */
export const getUsers = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const users = await userService.findAll();
    return res.status(200).json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getUsersbyId = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = await userService.findById(parseInt(id));
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    return res.status(200).json(user);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Autenticación de usuario (HU-007): valida credenciales y emite tokens JWT.
 *
 * @example
 * {
 *   "email": "david@example.com",
 *   "password": "password123"
 * }
 *
 * Respuestas:
 * - **200 OK** Retorna { user, accessToken, refreshToken }.
 * - **401 Unauthorized** Credenciales inválidas.
 * - **403 Forbidden** Correo sin verificar (debe activar su cuenta).
 * - **423 Locked** Cuenta bloqueada temporalmente por intentos fallidos.
 */
export const Auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { email, password } = req.body;
    const result = await userService.login(email, password, req.ip, req.headers["user-agent"]);

    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Renovación de tokens mediante refresh token (rotación).
 *
 * @example
 * {
 *   "refreshToken": "..."
 * }
 *
 * Respuestas:
 * - **200 OK** Retorna { user, accessToken, refreshToken }.
 * - **401 Unauthorized** Token de refresco inválido o expirado.
 */
export const refreshTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "refreshToken es requerido" });
    }

    const result = await userService.refresh(refreshToken);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Cierre de sesión (HU-007): revoca el refresh token recibido.
 *
 * @example
 * {
 *   "refreshToken": "..."
 * }
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    await userService.logout(refreshToken, req.ip, req.headers["user-agent"]);

    return successResponse(res, { message: "Sesión cerrada correctamente." });
  } catch (error) {
    next(error);
  }
};

/**
 * Solicitud de recuperación de contraseña (HU-007).
 * Responde siempre de forma genérica para no revelar si el correo existe.
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { email } = req.body as { email?: string };
    await userService.forgotPassword(email ?? "", req.ip, req.headers["user-agent"]);

    return successResponse(res, {
      message:
        "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Restablece la contraseña con un token válido (HU-007).
 *
 * @example
 * {
 *   "token": "...",
 *   "newPassword": "NuevaClave#2026"
 * }
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { token, newPassword } = req.body as { token?: string; newPassword?: string };
    await userService.resetPassword(token ?? "", newPassword ?? "", req.ip, req.headers["user-agent"]);

    return successResponse(res, {
      message: "Tu contraseña ha sido restablecida. Inicia sesión nuevamente.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cambia la ubicación (ciudad) del usuario autenticado (requiere Bearer token).
 *
 * @example
 * {
 *   "location": "Barranquilla"
 * }
 */
export const changeUserLocation = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    const { location } = req.body as { location?: string };

    if (!userId || !location) {
      return res.status(400).json({ error: "location es requerido y se requiere sesión activa" });
    }

    const updatedUser = await userService.changeUserLocation(userId, location);
    return res.status(200).json(updatedUser);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
