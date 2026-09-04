import sequelize from "../config/database";

import {
  GiftCard,
} from "../models";

import giftCardRepository from
  "../repositories/gift-card.repository";

import giftCardPaymentRepository from
  "../repositories/gift-card-payment.repository";

import mockPaymentGateway from
  "../gateways/mock-payment.gateway";

import giftCardService from
  "./gift-card.service";

import {
  AppError,
} from "../utils/apiResponse";

export type GiftCardPaymentMethod =
  | "card"
  | "pse"
  | "nequi"
  | "daviplata";

class GiftCardPaymentService {

  /*
   * ==========================================================
   * INICIAR PAGO
   * ==========================================================
   */

  async createPayment(
    userId: number,

    data: {
      giftCardId: number;

      paymentMethod:
        GiftCardPaymentMethod;

      paymentToken: string;
    }
  ) {

    const giftCard =
      await giftCardRepository
        .findById(
          data.giftCardId
        );

    if (
      !giftCard ||
      giftCard.purchaserUserId !==
        userId
    ) {
      throw new AppError(
        "Gift card no encontrada",
        404,
        "GIFT_CARD_NOT_FOUND"
      );
    }

    if (
      giftCard.status !==
      "pending_payment"
    ) {
      throw new AppError(
        "La gift card ya no está pendiente de pago",
        409,
        "GIFT_CARD_NOT_PENDING"
      );
    }

    /*
     * Si ya existe un intento aprobado
     * no cobramos nuevamente.
     */
    const existing =
      await giftCardPaymentRepository
        .findApprovedByGiftCardId(
          giftCard.id
        );

    if (existing) {

      return {
        giftCardId:
          giftCard.id,

        transactionReference:
          existing.transactionReference,

        status:
          "approved",

        amount:
          Number(
            existing.amount
          ),

        message:
          "El pago ya fue iniciado. Espera la confirmación del webhook.",
      };
    }

    /*
     * ========================================================
     * IVA
     * ========================================================
     */

    const taxPercent =
      Number(
        process.env.CART_TAX_PERCENT ||
          19
      );

    const giftCardValue =
      Number(
        giftCard.initialBalance
      );

    /*
     * La Gift Card tiene un valor
     * de $100.000.
     *
     * El pago, según la lógica fiscal
     * que ya utiliza tu proyecto,
     * será:
     *
     * 100.000
     * + 19% IVA
     * = 119.000
     */

    const tax =
      Math.round(
        giftCardValue *
          taxPercent
      ) /
      100;

    const total =
      Math.round(
        (
          giftCardValue +
          tax
        ) *
          100
      ) / 100;

    /*
     * ========================================================
     * PASARELA
     * ========================================================
     */

    const response =
      await mockPaymentGateway.charge({
        amount:
          total,

        paymentMethod:
          data.paymentMethod,

        paymentToken:
          data.paymentToken,
      });

    /*
     * TIMEOUT
     */

    if (
      response.status ===
      "timeout"
    ) {

      await giftCardPaymentRepository
        .create({
          giftCardId:
            giftCard.id,

          userId,

          paymentMethod:
            data.paymentMethod,

          transactionReference:
            response.transactionReference,

          amount:
            total,

          tax,

          status:
            "Rechazado",
        });

      await giftCardService
        .cancelPendingGiftCard(
          giftCard.id
        );

      return {
        giftCardId:
          giftCard.id,

        transactionReference:
          response.transactionReference,

        status:
          "timeout",

        amount:
          total,

        message:
          response.rejectionReason,
      };
    }

    const status =
      response.status ===
      "approved"
        ? "Aprobado"
        : "Rechazado";

    await giftCardPaymentRepository
      .create({
        giftCardId:
          giftCard.id,

        userId,

        paymentMethod:
          data.paymentMethod,

        transactionReference:
          response.transactionReference,

        amount:
          total,

        tax,

        status,
      });

    if (
      response.status ===
      "rejected"
    ) {

      await giftCardService
        .cancelPendingGiftCard(
          giftCard.id
        );
    }

    return {
      giftCardId:
        giftCard.id,

      transactionReference:
        response.transactionReference,

      status:
        response.status,

      amount:
        total,

      tax,

      giftCardValue,

      message:
        response.status ===
        "approved"
          ? "Pago autorizado. La Gift Card se activará al procesar el webhook."
          : "Pago rechazado.",
    };
  }

  /*
   * ==========================================================
   * WEBHOOK
   * ==========================================================
   */

  async processWebhook(
    transactionReference: string,

    status:
      | "approved"
      | "rejected"
  ) {

    const payment =
      await giftCardPaymentRepository
        .findByReference(
          transactionReference
        );

    if (!payment) {
      throw new AppError(
        "Pago de Gift Card no encontrado",
        404,
        "GIFT_CARD_PAYMENT_NOT_FOUND"
      );
    }

    const giftCard =
      await giftCardRepository
        .findById(
          payment.giftCardId
        );

    if (!giftCard) {
      throw new AppError(
        "Gift card asociada no encontrada",
        404,
        "GIFT_CARD_NOT_FOUND"
      );
    }

    /*
     * Webhook rechazado.
     */

    if (
      status === "rejected"
    ) {

      payment.status =
        "Rechazado";

      await payment.save();

      await giftCardService
        .cancelPendingGiftCard(
          giftCard.id
        );

      return {
        idempotent:
          false,

        giftCardId:
          giftCard.id,

        status:
          "rejected",
      };
    }

    /*
     * La pasarela debe haber
     * aprobado previamente el intento.
     */

    if (
      payment.status !==
      "Aprobado"
    ) {
      throw new AppError(
        "El pago no está aprobado por la pasarela",
        400,
        "PAYMENT_NOT_APPROVED"
      );
    }

    /*
     * Si ya está activa, el webhook
     * ya fue procesado.
     */

    if (
      giftCard.status ===
      "active"
    ) {

      return {
        idempotent:
          true,

        giftCardId:
          giftCard.id,

        transactionReference,
      };
    }

    await giftCardService
      .activateAfterPayment(
        giftCard.id,
        transactionReference
      );

    return {
      idempotent:
        false,

      giftCardId:
        giftCard.id,

      status:
        "active",
    };
  }

  /*
   * ==========================================================
   * CONSULTAR PAGO
   * ==========================================================
   */

  async getStatus(
    userId: number,
    transactionReference: string
  ) {

    const payment =
      await giftCardPaymentRepository
        .findByReference(
          transactionReference
        );

    if (!payment) {
      throw new AppError(
        "Pago no encontrado",
        404,
        "PAYMENT_NOT_FOUND"
      );
    }

    if (
      payment.userId !==
      userId
    ) {
      throw new AppError(
        "Pago no encontrado",
        404,
        "PAYMENT_NOT_FOUND"
      );
    }

    return {
      transactionReference:
        payment.transactionReference,

      giftCardId:
        payment.giftCardId,

      amount:
        Number(
          payment.amount
        ),

      tax:
        Number(
          payment.tax
        ),

      status:
        payment.status,

      paymentDate:
        payment.paymentDate,
    };
  }
}

export default new GiftCardPaymentService();