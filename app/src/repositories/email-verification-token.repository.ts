// app/src/repositories/email-verification-token.repository.ts

import { Transaction } from "sequelize";
import EmailVerificationToken, {
  EmailVerificationTokenCreationAttributes,
} from "../models/email-verification-token.model";

class EmailVerificationTokenRepository {
  async create(
    data: EmailVerificationTokenCreationAttributes,
    transaction?: Transaction
  ): Promise<EmailVerificationToken> {
    return await EmailVerificationToken.create(data, { transaction });
  }

  async findByHash(tokenHash: string): Promise<EmailVerificationToken | null> {
    return await EmailVerificationToken.findOne({ where: { tokenHash } });
  }

  async markAsUsed(id: number, transaction?: Transaction): Promise<void> {
    await EmailVerificationToken.update(
      { usedAt: new Date() },
      { where: { id }, transaction }
    );
  }
}

export default new EmailVerificationTokenRepository();
