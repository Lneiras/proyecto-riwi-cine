

import { Request, Response } from "express";
import membershipService from "../services/membership.service";
import { successResponse, AppError } from "../utils/apiResponse";
import { validateCalculateDiscountDto } from "../dto/calculate-discount.dto";

/**
 * GET /api/v1/membership
 * Obtiene la membresía del usuario autenticado
 */
export const getMembership = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const userId = req.userId;
        if (!userId) throw new AppError("Sesión requerida", 401, "UNAUTHORIZED");

        const membership = await membershipService.getByUserId(userId);
        const infoMembership = {
            id: membership.id,
            name: membership.name,
            ticketDiscount: Number(membership.ticketDiscount),
            snackDiscount: Number(membership.snackDiscount),
            minPoints: membership.minPoints,
        };
        return successResponse(res, infoMembership, 200);
    } catch (error: any) {
        if (error instanceof AppError) throw error;
        if (error.message === "Membership not found") {
        throw new AppError("Membresía no encontrada", 404, "MEMBERSHIP_NOT_FOUND");
        }
        throw new AppError(error.message, 500, "INTERNAL_ERROR");
    }
};

/**
 * GET /api/v1/membership/benefits
 * Obtiene los beneficios del nivel de membresía actual
 */
export const getMembershipBenefits = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const userId = req.userId;
        if (!userId) throw new AppError("Sesión requerida", 401, "UNAUTHORIZED");

        const benefits = await membershipService.getBenefitsByUserId(userId);
        return successResponse(res, benefits, 200);
    } catch (error: any) {
        if (error instanceof AppError) throw error;
        if (error.message === "Membership not found") {
        throw new AppError("Membresía no encontrada", 404, "MEMBERSHIP_NOT_FOUND");
        }
        throw new AppError(error.message, 500, "INTERNAL_ERROR");
    }
};


/**
 * POST /api/v1/membership/discount/calculate
 * Calcula el descuento aplicable según el nivel de membresía del usuario
 */
export const postCalculateMembershipDiscount = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const userId = req.userId;
        if (!userId) throw new AppError("Sesión requerida", 401, "UNAUTHORIZED");

        const { valid, error, data } = validateCalculateDiscountDto(req.body);
        if (!valid) throw new AppError(error!, 400, "VALIDATION_ERROR");

        const result = await membershipService.calculateDiscount(userId, data);
        return successResponse(res, result, 200);
    } catch (error: any) {
        if (error instanceof AppError) throw error;
        if (error.message === "Membership not found") {
            throw new AppError("Membresía no encontrada", 404, "MEMBERSHIP_NOT_FOUND");
        }
        throw new AppError(error.message, 500, "INTERNAL_ERROR");
    }
};

/**
 * GET /api/v1/membership/qr
 * Obtiene (o genera si es la primera vez) el código QR de membresía
 * del usuario autenticado 
 */
export const getMembershipQr = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const userId = req.userId;
        if (!userId) throw new AppError("Sesión requerida.", 401, "UNAUTHORIZED");

        const result = await membershipService.getOrCreateQr(userId);
        return successResponse(res, result, 200);
    } catch (error: any) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message, 500, "INTERNAL_ERROR");
    }
};