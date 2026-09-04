import {
  Request,
  Response,
  NextFunction,
} from "express";

import giftCardPaymentService, {GiftCardPaymentMethod} from
  "../services/gift-card-payment.service";

import {
  AppError,
} from "../utils/apiResponse";

const allowedMethods = [
  "card",
  "pse",
  "nequi",
  "daviplata",
];

export async function payGiftCard(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const {
      giftCardId,
      paymentMethod,
      paymentToken,
    } = req.body as {paymentMethod: GiftCardPaymentMethod, giftCardId: number, paymentToken: string}

    if (
      !Number.isInteger(
        giftCardId
      ) ||
      giftCardId <= 0
    ) {
      throw new AppError(
        "giftCardId debe ser un entero mayor que 0",
        400,
        "INVALID_GIFT_CARD_ID"
      );
    }

    if (
      !allowedMethods.includes(
        paymentMethod
      )
    ) {
      throw new AppError(
        "paymentMethod debe ser card, pse, nequi o daviplata",
        400,
        "INVALID_PAYMENT_METHOD"
      );
    }

    if (
      typeof paymentToken !==
        "string" ||
      paymentToken.trim()
        .length === 0
    ) {
      throw new AppError(
        "paymentToken es obligatorio",
        400,
        "INVALID_PAYMENT_TOKEN"
      );
    }

    const result =
      await giftCardPaymentService.createPayment(
          req.userId!,
          {
            giftCardId,

            paymentMethod,

            paymentToken:
              paymentToken.trim(),
          }
        );

    return res.json({
      success: true,

      data: result,
    });

  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError(
            "No fue posible procesar el pago de la Gift Card",
            400,
            "GIFT_CARD_PAYMENT_ERROR"
          )
    );
  }
}

export async function giftCardPaymentWebhook(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const {
      transactionReference,
      status,
    } = req.body;

    if (
      typeof transactionReference !==
        "string" ||
      !transactionReference.trim()
    ) {
      throw new AppError(
        "transactionReference es obligatorio",
        400,
        "INVALID_TRANSACTION_REFERENCE"
      );
    }

    if (
      status !== "approved" &&
      status !== "rejected"
    ) {
      throw new AppError(
        "status debe ser approved o rejected",
        400,
        "INVALID_WEBHOOK_STATUS"
      );
    }

    const result =
      await giftCardPaymentService
        .processWebhook(
          transactionReference.trim(),
          status
        );

    return res.json({
      success: true,

      data: result,
    });

  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError(
            "No fue posible procesar el webhook de Gift Card",
            400,
            "GIFT_CARD_WEBHOOK_ERROR"
          )
    );
  }
}

export async function getGiftCardPaymentStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const reference =
      String(
        req.query.transactionReference ||
          ""
      ).trim();

    if (!reference) {
      throw new AppError(
        "transactionReference es obligatorio",
        400,
        "INVALID_TRANSACTION_REFERENCE"
      );
    }

    const result =
      await giftCardPaymentService
        .getStatus(
          req.userId!,
          reference
        );

    return res.json({
      success: true,

      data: result,
    });

  } catch (error) {
    return next(error);
  }
}