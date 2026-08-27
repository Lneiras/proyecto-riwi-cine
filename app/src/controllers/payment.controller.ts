import {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  AppError,
  successResponse,
} from "../utils/apiResponse";

import {
  validateCreatePaymentDto,
} from "../dto/payment.dto";

import paymentService from
  "../services/payment.service";

export const createPayment =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {

    try {

      if (!req.userId) {
        throw new AppError(
          "Sesión requerida.",
          401,
          "UNAUTHORIZED"
        );
      }

      const validation =
        validateCreatePaymentDto(
          req.body
        );

      if (
        !validation.valid ||
        !validation.data
      ) {
        throw new AppError(
          validation.error ??
            "Datos inválidos.",
          400,
          "VALIDATION_ERROR"
        );
      }

      const result =
        await paymentService.createPayment(
          req.userId,
          validation.data
        );

      return successResponse(
        res,
        result,
        200
      );

    } catch (error) {

      if (error instanceof AppError) {
        return next(error);
      }

      const message =
        error instanceof Error
          ? error.message
          : "No fue posible procesar el pago";

      next(
        new AppError(
          message,
          400,
          "PAYMENT_ERROR"
        )
      );
    }
  };

export const createPaymentFromCart =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {

    try {

      if (!req.userId) {
        throw new AppError(
          "Sesión requerida.",
          401,
          "UNAUTHORIZED"
        );
      }

      const validation =
        validateCreatePaymentDto(
          req.body
        );

      if (
        !validation.valid ||
        !validation.data
      ) {
        throw new AppError(
          validation.error ??
            "Datos inválidos.",
          400,
          "VALIDATION_ERROR"
        );
      }

      const result =
        await paymentService
          .createPaymentFromCart(
            req.userId,
            validation.data
          );

      return successResponse(
        res,
        result,
        200
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
            : "No fue posible procesar el pago",
          400,
          "PAYMENT_ERROR"
        )
      );
    }
  };

export const getPaymentStatus =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {

    try {

      if (!req.userId) {
        throw new AppError(
          "Sesión requerida.",
          401,
          "UNAUTHORIZED"
        );
      }

      const reference =
        String(
          req.query.transactionReference ??
            ""
        ).trim();

      if (!reference) {
        throw new AppError(
          "transactionReference es obligatorio.",
          400,
          "VALIDATION_ERROR"
        );
      }

      const result =
        await paymentService.getStatus(
          req.userId,
          reference
        );

      return successResponse(
        res,
        result,
        200
      );

    } catch (error) {

      if (error instanceof AppError) {
        return next(error);
      }

      const message =
        error instanceof Error
          ? error.message
          : "No fue posible consultar el pago";

      next(
        new AppError(
          message,
          message ===
            "Pago no encontrado"
            ? 404
            : 400,
          "PAYMENT_STATUS_ERROR"
        )
      );
    }
  };

export const paymentWebhook =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {

    try {

      const {
        transactionReference,
        status,
      } = req.body as {
        transactionReference?: string;
        status?:
          | "approved"
          | "rejected";
      };

      if (
        !transactionReference ||
        (
          status !== "approved" &&
          status !== "rejected"
        )
      ) {
        throw new AppError(
          "transactionReference y status (approved/rejected) son obligatorios.",
          400,
          "VALIDATION_ERROR"
        );
      }

      const result =
        await paymentService.processWebhook(
          transactionReference,
          status
        );

      return successResponse(
        res,
        result,
        200
      );

    } catch (error) {

      if (error instanceof AppError) {
        return next(error);
      }

      const message =
        error instanceof Error
          ? error.message
          : "No fue posible procesar el webhook";

      next(
        new AppError(
          message,
          400,
          "WEBHOOK_ERROR"
        )
      );
    }
  };