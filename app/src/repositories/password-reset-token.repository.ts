// app/src/repositories/password-reset-token.repository.ts

import PasswordResetToken, {
  PasswordResetTokenCreationAttributes,
} from "../models/password-reset-token.model";

/**
 * Repository de Tokens de Recuperación de Contraseña (HU-007).
 */
class PasswordResetTokenRepository {
  async create(data: PasswordResetTokenCreationAttributes): Promise<PasswordResetToken> {
    return await PasswordResetToken.create(data);
  }

  async findByHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return await PasswordResetToken.findOne({ where: { tokenHash } });
  }

  async markAsUsed(id: number): Promise<void> {
    await PasswordResetToken.update({ usedAt: new Date() }, { where: { id } });
  }
}

export default new PasswordResetTokenRepository();
