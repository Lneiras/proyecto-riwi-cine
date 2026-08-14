import User, { UserCreationAttributes } from "../../models/user.model";
import RefreshToken from "../../models/refresh-token.model";

export interface IAuthRepository {
  /**
   * Crea un usuario.
   */
  create(data: UserCreationAttributes): Promise<User>;

  /**
   * Obtiene un usuario por su email.
   */
  findByEmail(email: string): Promise<User | null>;

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
}