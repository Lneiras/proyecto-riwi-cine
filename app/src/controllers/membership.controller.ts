// app/src/controllers/membership.controller.ts

import { NextFunction, Request, Response } from "express";
import MembershipService from "../services/membership.service";
import { AppError, successResponse } from "../utils/apiResponse";

export const createMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new AppError("Sesión requerida.", 401, "AUTH_REQUIRED");
    }

    const result = await MembershipService.createForUser(userId);
    return successResponse(
      res,
      result.membership,
      result.created ? 201 : 200
    );
  } catch (error) {
    next(error);
  }
};
