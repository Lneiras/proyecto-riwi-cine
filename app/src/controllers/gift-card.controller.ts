import {
  Request,
  Response,
  NextFunction,
} from "express";

import giftCardService from
  "../services/gift-card.service";

import {
  AppError,
} from "../utils/apiResponse";

export async function createGiftCard(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const card =
      await giftCardService
        .createForPurchase(
          req.userId!,
          req.body
        );

    return res.status(201).json({
      success: true,

      data: {
        giftCard:
          card,

        message:
          "Gift Card creada. Ahora debes realizar el pago.",
      },
    });

  } catch (error) {

    return next(
      error instanceof AppError
        ? error
        : new AppError(
            "No fue posible crear la Gift Card",
            500,
            "GIFT_CARD_ERROR"
          )
    );
  }
}

export async function listPurchasedGiftCards(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    return res.json({
      success: true,

      data:
        await giftCardService
          .findPurchased(
            req.userId!
          ),
    });

  } catch (error) {
    return next(error);
  }
}

export async function getPurchasedGiftCard(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const id =
      Number(
        req.params.id
      );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      throw new AppError(
        "ID inválido",
        400,
        "INVALID_ID"
      );
    }

    return res.json({
      success: true,

      data:
        await giftCardService
          .findPurchasedById(
            req.userId!,
            id
          ),
    });

  } catch (error) {
    return next(error);
  }
}