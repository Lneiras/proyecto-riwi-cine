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

  /**
   * Obtiene un usuario por su email.
   */
  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  /**
   * Persiste un refresh token emitido.
   */
  async saveRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date
  ): Promise<RefreshToken> {
    return await RefreshToken.create({ userId, token, expiresAt });
    }

    /**
    * Busca un refresh token vigente (no revocado ni expirado). 
    * 
    * */
  async findValidRefreshToken(token: string): Promise<RefreshToken | null> {
    return await RefreshToken.findOne({
      where: {
        token,
        revoked: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });
  }

  /**
   * Revoca un refresh token.
   */
  async revokeRefreshToken(token: string): Promise<void> {
    const refreshToken = await RefreshToken.findOne({ where: { token } });
    if (refreshToken) {
      refreshToken.revoked = true;
      await refreshToken.save();
    }
  }
}

export default new AuthRepository();