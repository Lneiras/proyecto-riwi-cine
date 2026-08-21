// app/src/repositories/bonus-wallet.repository.ts

import { Transaction } from "sequelize";
import BonusWallet from "../models/bonus-wallet.model";

class BonusWalletRepository {
  async create(userId: number, transaction?: Transaction): Promise<BonusWallet> {
    return await BonusWallet.create({ userId, balance: 0 }, { transaction });
  }
}

export default new BonusWalletRepository();
