import { Request, Response } from "express";
import seatService from "../services/seat.service";

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

    return res.status(500).json({
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

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No fue posible bloquear los asientos";

    const status =
      message.includes("ya está reservado") ||
      message.includes("ya fue vendido")
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

    if (!Number.isInteger(functionId) || !Array.isArray(seatIds)) {
      return res.status(400).json({
        error: "functionId y seatIds son obligatorios",
      });
    }

    const released = await seatService.releaseSeats(
      functionId,
      seatIds,
      req.userId
    );

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

    return res.status(500).json({
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

    if (!Number.isInteger(functionId)) {
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

    return res.status(500).json({
      success: false,
      error: message,
    });
  }
};