import { Transaction } from "sequelize";

import Payment, {
  PaymentCreationAttributes,
} from "../models/payment.model";

class PaymentRepository {

  async findByTransactionReference(
    reference: string,
    transaction?: Transaction
  ) {
    return Payment.findOne({
      where: {
        transactionReference:
          reference,
      },

      transaction,
    });
  }

  async findApprovedByReservationId(
    reservationId: number,
    transaction?: Transaction
  ) {
    return Payment.findOne({
      where: {
        reservationId,
        status: "Aprobado",
      },

      order: [
        ["id", "DESC"],
      ],

      transaction,
    });
  }

  async create(
    data: PaymentCreationAttributes,
    transaction?: Transaction
  ) {
    return Payment.create(
      data,
      { transaction }
    );
  }
}

export default new PaymentRepository();