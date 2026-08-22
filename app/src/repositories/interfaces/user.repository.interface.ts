// app/src/repositories/interfaces/user.repository.interface.ts

import User, { UserCreationAttributes } from "../../models/user.model";
import RefreshToken from "../../models/refresh-token.model";

/**
 * Contrato del Repositorio de Usuarios
 * -----------------------------------
 * Define las operaciones de persistencia disponibles para la entidad User.
 *
 * Cualquier implementación deberá cumplir esta interfaz.
 */

export interface IUserRepository {
  /**
   * Crea un usuario.
   */
  create(data: UserCreationAttributes): Promise<User>;

  /**
   * Obtiene todos los usuarios.
   */
  findAll(): Promise<User[]>;

  /**
   * Obtiene un usuario por su id.
   */
  findById(id: number): Promise<User | null>;

  /**
   * Obtiene un usuario por su email.
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Actualiza la ciudad (ubicación) de un usuario.
   */
  changeUserLocation(userId: number, cityId: number): Promise<User | null>;

  /**
   * Persiste un refresh token emitido.
   */
  saveRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date
  ): Promise<RefreshToken>;

  /**
   * Busca un refresh token vigente (no revocado ni expirado).
   */
  findValidRefreshToken(token: string): Promise<RefreshToken | null>;

  /**
   * Revoca un refresh token.
   */
  revokeRefreshToken(token: string): Promise<void>;

  /**
   * Revoca todos los refresh tokens activos del usuario (HU-007).
   */
  revokeAllRefreshTokens(userId: number): Promise<void>;

  update(id: number, data: Partial<UserCreationAttributes>): Promise<User | null>;

  delete(id: number): Promise<void>;
}
