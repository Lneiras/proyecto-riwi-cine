import User, { UserCreationAttributes } from "../models/user.model";
import RefreshToken from "../models/refresh-token.model";
import { IAuthRepository } from "./interfaces/auth.repository.interface";
import { Op } from "sequelize";


/**
 * Repositorio de Autenticación
 * ----------------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la autenticación y gestión de usuarios.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */
class AuthRepository implements IAuthRepository {
  /**
   * Crea un nuevo usuario.
   */
  async create(data: UserCreationAttributes): Promise<User> {
    return await User.create(data);
  }

}

export default new AuthRepository();