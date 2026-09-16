import {
  NextFunction,
  Request,
  Response,
} from "express";

import checkoutService from
  "../services/checkout.service";

import {
  AppError,
  successResponse,
} from "../utils/apiResponse";

export async function checkout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {

  try {

    if (!req.userId) {
      throw new AppError(
        "Sesión requerida.",
        401,
        "UNAUTHORIZED"
      );
    }

    const result =
      await checkoutService
        .createReservationFromCart(
          req.userId
        );

    return successResponse(
      res,
      result,
      201
    );

  } catch (error) {

    if (
      error instanceof AppError
    ) {
      return next(error);
    }

    next(
      new AppError(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar el checkout",
        400,
        "CHECKOUT_ERROR"
      )
    );
  }
}