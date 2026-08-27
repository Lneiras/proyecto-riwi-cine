import sequelize from "../config/database";
import giftCardRepository from "../repositories/gift-card.repository";
import { AppError } from "../utils/apiResponse";
import { generateGiftCardCode, hashGiftCardCode } from "../utils/giftCardCode";
import emailService from "./email.service";

export interface CreateGiftCardInput {
  amount: number; recipientEmail: string; recipientName?: string | null;
  senderName?: string | null; message?: string | null;
}

class GiftCardService {
  async createForPurchase(userId: number, input: CreateGiftCardInput) {
    const min = Number(process.env.GIFT_CARD_MIN_AMOUNT || 10000);
    const max = Number(process.env.GIFT_CARD_MAX_AMOUNT || 500000);
    if (!Number.isFinite(input.amount) || input.amount < min || input.amount > max) {
      throw new AppError(`El valor debe estar entre ${min} y ${max}`, 400, "INVALID_GIFT_CARD_AMOUNT");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.recipientEmail)) {
      throw new AppError("El correo del destinatario no es válido", 400, "INVALID_RECIPIENT_EMAIL");
    }
    if (input.message && input.message.length > 500) {
      throw new AppError("El mensaje no puede superar 500 caracteres", 400, "MESSAGE_TOO_LONG");
    }
    return sequelize.transaction(async (transaction) => {
      const card = await giftCardRepository.create({ purchaserUserId: userId,
        recipientEmail: input.recipientEmail.trim().toLowerCase(), recipientName: input.recipientName?.trim() || null,
        senderName: input.senderName?.trim() || null, message: input.message?.trim() || null,
        initialBalance: input.amount, availableBalance: 0, status: "pending_payment" }, transaction);
      await giftCardRepository.addTransaction({ giftCardId: card.id, userId, type: "created",
        amount: input.amount, balanceAfter: 0 }, transaction);
      return card;
    });
  }

  findPurchased(userId: number) { return giftCardRepository.findPurchased(userId); }

  async findPurchasedById(userId: number, id: number) {
    const card = await giftCardRepository.findById(id);
    if (!card || card.purchaserUserId !== userId) throw new AppError("Gift card no encontrada", 404, "GIFT_CARD_NOT_FOUND");
    return card;
  }

  /** Punto de integración interno para la futura HU de pagos. */
  async activateAfterPayment(giftCardId: number, paymentReference: string): Promise<void> {
    const code = generateGiftCardCode();
    const expirationDays = Number(process.env.GIFT_CARD_EXPIRATION_DAYS || 365);
    const expiresAt = new Date(Date.now() + expirationDays * 86400000);
    const card = await sequelize.transaction(async (transaction) => {
      const current = await giftCardRepository.findById(giftCardId);
      if (!current || current.status !== "pending_payment") {
        throw new AppError("La gift card no se puede activar", 409, "GIFT_CARD_NOT_PENDING");
      }
      current.codeHash = hashGiftCardCode(code);
      current.codeLastFour = code.slice(-4);
      current.availableBalance = Number(current.initialBalance);
      current.status = "active";
      current.activatedAt = new Date(); current.expiresAt = expiresAt;
      await current.save({ transaction });
      await giftCardRepository.addTransaction({ giftCardId: current.id, userId: current.purchaserUserId,
        type: "activated", amount: Number(current.initialBalance), balanceAfter: Number(current.initialBalance),
        reference: paymentReference }, transaction);
      return current;
    });
    await emailService.sendGiftCardEmail({ to: card.recipientEmail, recipientName: card.recipientName,
      senderName: card.senderName, message: card.message, code, amount: Number(card.initialBalance), expiresAt });
    card.sentAt = new Date(); await card.save();
  }
}

export default new GiftCardService();
