// app/src/repositories/user.repository.ts

import User, { UserCreationAttributes } from "../models/user.model";
import RefreshToken from "../models/refresh-token.model";
import UserMembership from "../models/user-membership.model";
import Membership from "../models/membership.model";
import { IUserRepository } from "./interfaces/user.repository.interface";
import CityRepository from "./cities.repository";
import { Op, Transaction } from "sequelize";

/**
 * Repositorio de Usuarios
 * -----------------------
 * Implementa el patrón Repository para encapsular todas las operaciones
 * de persistencia relacionadas con la entidad User.
 */
class UserRepository implements IUserRepository {
  async create(data: UserCreationAttributes, transaction?: Transaction): Promise<User> {
    return await User.create(data, { transaction });
  }

  async findAll(): Promise<User[]> {
    return await User.findAll({
      include: [{ model: UserMembership, include: [{ model: Membership }] }],
    });
  }

  async findById(id: number): Promise<User | null> {
    return await User.findByPk(id, {
      include: [{ model: UserMembership, include: [{ model: Membership }] }],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({
      where: { email },
      include: [{ model: UserMembership, include: [{ model: Membership }] }],
    });
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

  /**
   * Revoca todos los refresh tokens activos del usuario (HU-007:
   * invalida sesiones previas al iniciar sesión o tras resetear contraseña).
   */
  async revokeAllRefreshTokens(userId: number): Promise<void> {
    await RefreshToken.update(
      { revoked: true },
      { where: { userId, revoked: false } }
    );
  }

  async update(
    id: number,
    data: Partial<UserCreationAttributes>,
    transaction?: Transaction
  ): Promise<User> {
    const user = await User.findByPk(id, { transaction });
    if (!user) throw new Error("User not found");
    return await user.update(data, { transaction });
  }

  async delete(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) throw new Error("User not found");
    return await user.destroy();
  }
}

export default new UserRepository();
