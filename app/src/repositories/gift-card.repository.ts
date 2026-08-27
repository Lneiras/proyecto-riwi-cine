import { Transaction } from "sequelize";
import { GiftCard, GiftCardTransaction } from "../models";
import { GiftCardCreationAttributes } from "../models/gift-card.model";
import { GiftCardTransactionType } from "../models/gift-card-transaction.model";

class GiftCardRepository {
  create(data: GiftCardCreationAttributes, transaction?: Transaction) {
    return GiftCard.create(data, { transaction });
  }
  findById(id: number) { return GiftCard.findByPk(id); }
  findByCodeHash(codeHash: string) { return GiftCard.findOne({ where: { codeHash } }); }
  findPurchased(userId: number) {
    return GiftCard.findAll({ where: { purchaserUserId: userId }, order: [["createdAt", "DESC"]] });
  }
  addTransaction(data: { giftCardId: number; userId?: number | null; type: GiftCardTransactionType;
    amount: number; balanceAfter: number; reference?: string | null }, transaction?: Transaction) {
    return GiftCardTransaction.create({ userId: null, reference: null, ...data }, { transaction });
  }
}
export default new GiftCardRepository();
