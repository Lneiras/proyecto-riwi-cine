import { Request, Response } from "express";
import seatService from "../services/seat.service";
import cartService from "../services/cart.service";

export const getSeats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const showtimeId = Number(req.params.id);

    if (!Number.isInteger(showtimeId)) {
      return res.status(400).json({
        error: "El id de la función debe ser un número entero",
      });
    }

    const data = await seatService.getSeats(showtimeId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error obteniendo asientos";

    const status = message === "Función no encontrada" ? 404 : 500;

    return res.status(status).json({
      success: false,
      error: message,
    });
  }
};

export const lockSeats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: "Usuario no autenticado",
      });
    }

    const { functionId, seatIds } = req.body as {
      functionId: number;
      seatIds?: number[];
    };

    if (
      !Number.isInteger(functionId) ||
      functionId <= 0 ||
      !Array.isArray(seatIds) ||
      seatIds.length === 0 ||
      !seatIds.every(Number.isInteger)
    ) {
      return res.status(400).json({
        error: "functionId y seatIds son obligatorios",
      });
    }

    const data = await seatService.lockSeats(
      functionId,
      seatIds,
      req.userId
    );

    let cart;
    try {
      cart = await cartService.addLockedSeats(req.userId, functionId, data.seatIds);
    } catch (error) {
      await seatService.releaseSeats(functionId, data.seatIds, req.userId);
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: { ...data, cart },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No fue posible bloquear los asientos";

    const status =
      message.includes("ya está reservado") ||
      message.includes("ya fue vendido") ||
      message.includes("inhabilitado") ||
      message.includes("preferencial")
        ? 409
        : 400;

    return res.status(status).json({
      success: false,
      error: message,
    });
  }
};

export const releaseSeats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: "Usuario no autenticado",
      });
    }

    const { functionId, seatIds } = req.body as {
      functionId: number;
      seatIds?: number[];
    };

    if (!Number.isInteger(functionId) || 
        functionId <= 0 ||
        !Array.isArray(seatIds) ||
        seatIds.length === 0 ||
        !seatIds.every(Number.isInteger)) {
      return res.status(400).json({
        error: "functionId y seatIds son obligatorios",
      });
    }

    const released = await seatService.releaseSeats(
      functionId,
      seatIds,
      req.userId
    );

    await cartService.removeTickets(req.userId, functionId, released).catch(() => undefined);

    return res.status(200).json({
      success: true,
      data: {
        functionId,
        releasedSeats: released,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No fue posible liberar los asientos";

    const status =
      message.includes("no pertenece") || message.includes("inválido")
        ? 400
        : 500;

    return res.status(status).json({
      success: false,
      error: message,
    });
  }
};

export const getReservationSummary = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const functionId = Number(req.query.functionId);

    if (!Number.isInteger(functionId) ||
        functionId <= 0
    ) {
      return res.status(400).json({
        error: "functionId es obligatorio",
      });
    }

    const data = await seatService.getSummary(functionId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No fue posible obtener el resumen";

    const status= 
      message === "función no encontrada" ? 404 : 500;

    return res.status(status).json({
      success: false,
      error: message,
    });
  }
};
