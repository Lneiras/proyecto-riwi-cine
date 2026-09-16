import {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  AppError,
  successResponse,
} from "../utils/apiResponse";

import orderService from "../services/order.service";

import {
  validateCreateOrderDto,
} from "../dto/order.dto";

export const createOrder =
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
        validateCreateOrderDto(
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
        await orderService.createOrder(
          req.userId,
          validation.data
        );

      return successResponse(
        res,
        result,
        201
      );

    } catch (error) {

      if (error instanceof AppError) {
        return next(error);
      }

      const message =
        error instanceof Error
          ? error.message
          : "No fue posible crear la orden";

      const status =
        message.includes(
          "expiraron"
        ) ||
        message.includes(
          "no están bloqueados"
        ) ||
        message.includes(
          "Stock insuficiente"
        )
          ? 409
          : message.includes(
              "no existe"
            ) ||
            message.includes(
              "Función no encontrada"
            )
            ? 404
            : 400;

      next(
        new AppError(
          message,
          status,
          "ORDER_ERROR"
        )
      );
    }
  };