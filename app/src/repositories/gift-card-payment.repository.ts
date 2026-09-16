import {
  Transaction,
} from "sequelize";

import {
  GiftCardPayment,
} from "../models";

class GiftCardPaymentRepository {

  async create(
    data: any,
    transaction?: Transaction
  ) {
    return GiftCardPayment.create(
      data,
      {
        transaction,
      }
    );
  }

  async findByReference(
    transactionReference: string,
    transaction?: Transaction
  ) {
    return GiftCardPayment.findOne({
      where: {
        transactionReference,
      },

      transaction,
    });
  }

  async findByGiftCardId(
    giftCardId: number
  ) {
    return GiftCardPayment.findOne({
      where: {
        giftCardId,
      },

      order: [
        [
          "id",
          "DESC",
        ],
      ],
    });
  }

  async findApprovedByGiftCardId(
    giftCardId: number
  ) {
    return GiftCardPayment.findOne({
      where: {
        giftCardId,

        status:
          "Aprobado",
      },

      order: [
        [
          "id",
          "DESC",
        ],
      ],
    });
  }
}

export default new GiftCardPaymentRepository();