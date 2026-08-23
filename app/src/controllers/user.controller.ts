import { Request, Response } from "express";
import userService from "../services/user.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { validateUpdateProfileDto } from "../dto/update-profile.dto";
import { successResponse, AppError } from "../utils/apiResponse";

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
 * Autenticación de usuario: valida credenciales y emite tokens JWT.
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
 */
export const Auth = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;
    const result = await userService.login(email, password);

    if (!result) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
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
export const refreshTokens = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "refreshToken es requerido" });
    }

    const result = await userService.refresh(refreshToken);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(401).json({ error: error.message });
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


// esto trae el perfil del usuario autenticado, requiere que el usuario esté logueado y tenga un token válido
export const getProfile = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId; // con esto traemos el id del usuario autenticado, que se encuentra en el token JWT
    if (!userId) throw new AppError("Debes tener una sesión activa.", 401, "UNAUTHORIZED");
    // si no hay in userId, significa que el usuario no está autenticado, por lo que se lanza un error con código 401

    const user = await userService.findById(userId); // con esto traemos el usuario de la base de datos, usando el id del token
    if (!user) throw new AppError("Usuario no encontrado.", 404, "USER_NOT_FOUND");
    // si no se encuentra el usuario en la base de datos, significa que el usuario no existe, por lo que se lanza un error con código 404

    return successResponse(res, user, 200); // si todo sale bien, se retorna el usuario
  } catch (error: any) {  // con esto si ocurre un error diferente a los de arriba, se captura y se lanza un error con código 500
    if (error instanceof AppError) throw error;
    throw new AppError(error.message, 500, "INTERNAL_ERROR");
  }
};

// esto permite actualizar el perfil del usuario autenticado, 
// requiere que el usuario esté logueado y tenga un token válido
export const updateProfile = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;  // con esto traemos el id del usuario autenticado, que se encuentra en el token JWT
    if (!userId) throw new AppError("Debes tener una sesión activa.", 401, "UNAUTHORIZED");
    // si no hay in userId, significa que el usuario no está autenticado, por lo que se lanza un error con código 401


    /* esto { valid, errors, data } se llama desestructuración de objetos 
    * la función validateUpdateProfileDto devuelve un solo objeto con varias propiedades adentro, 
    * y la desestructuración las "desempaqueta" en variables independientes en una sola línea.
    * 
    * valid: Un booleano (true o false) que indica si el cuerpo de la petición (req.body) pasó con éxito las reglas de validación.
    * errors: Un array con los mensajes de error en caso de que el DTO no sea válido. Si valid es true, suele valer null o undefined
    * data: El objeto con los datos ya sanitizados y limpios, listo para mandarse al userService.updateProfile(userId, data).
    */
    const { valid, error, data } = validateUpdateProfileDto(req.body);
    if (!valid) throw new AppError(error!, 400, "VALIDATION_ERROR");
    // si valid es false, significa que el DTO no pasó la validación, 
    // por lo que se lanza un error con código 400 y el mensaje de error correspondiente


    const updatedUser = await userService.updateProfile(userId, data);
    // con esto se llama al servicio de usuario para actualizar el perfil del usuario autenticado,
    // pasando el id del usuario y los datos validados del DTO (data) que se quieren actualizar
    return successResponse(res, updatedUser, 200); // si todo sale bien, se retorna el usuario actualizado
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    if (error.message === "User not found") { // si el error es que el usuario no se encontró, se lanza un error con código 404
      throw new AppError("Usuario no encontrado.", 404, "USER_NOT_FOUND");
    }
    if (error.message === "Email already in use") {
      throw new AppError("Ese correo ya está en uso por otra cuenta.", 409, "EMAIL_IN_USE");
    }
    throw new AppError(error.message, 500, "INTERNAL_ERROR"); // si ocurre un error diferente a los de arriba, se captura y se lanza un error con código 500
  }
};
