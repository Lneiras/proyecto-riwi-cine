// app/src/repositories/user.repository.ts

import User, { UserCreationAttributes } from "../models/user.model";
import RefreshToken from "../models/refresh-token.model";
import { IUserRepository } from "./interfaces/user.repository.interface";
import CityRepository from "./cities.repository";
import { Op } from "sequelize";

/**
 * Repositorio de Usuarios
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad User.
 *
 * Esta clase es la única responsable de interactuar con Sequelize.
 */

class UserRepository implements IUserRepository {
  /**
   * Crea un nuevo usuario.
   */
  async create(data: UserCreationAttributes): Promise<User> {
    return await User.create(data);
  }

  /**
   * Obtiene todos los usuarios.
   */
  async findAll(): Promise<User[]> {
    return await User.findAll();
  }

  async findById(id: number): Promise<User | null> {
    return await User.findByPk(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  async changeUserLocation(userId: number, cityId: number): Promise<User | null> {
    const user = await this.findById(userId);
    if (!user) throw new Error("Usuario no encontrado");
    return await user.update({ cityId });
  }

  async saveRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date
  ): Promise<RefreshToken> {
    return await RefreshToken.create({ userId, token, expiresAt });
  }

  async findValidRefreshToken(token: string): Promise<RefreshToken | null> {
    return await RefreshToken.findOne({
      where: {
        token,
        revoked: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await RefreshToken.update({ revoked: true }, { where: { token } });
  }

  async update(id: number, data: Partial<UserCreationAttributes>): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new Error("User not found");
    return await user.update(data);
  }

  async delete(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) throw new Error("User not found");
    return await user.destroy();
  }
}

export default new UserRepository();
