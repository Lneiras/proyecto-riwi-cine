
import { NextFunction, Request, Response } from "express";
import MembershipService from "../services/membership.service";
import { successResponse, AppError } from "../utils/apiResponse";
import { validateCalculateDiscountDto } from "../dto/calculate-discount.dto";


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

/**
 * GET /api/v1/membership
 * Obtiene la membresía del usuario autenticado
 */
export const getMembership = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const userId = req.userId;
        if (!userId) throw new AppError("Sesión requerida.", 401, "UNAUTHORIZED");

        const membership = await MembershipService.getByUserId(userId);
        const responseData = {
            id: membership.id,
            name: membership.name,
            ticketDiscount: Number(membership.ticketDiscount),
            snackDiscount: Number(membership.snackDiscount),
            minPoints: membership.minPoints,
        };
        return successResponse(res, responseData, 200);
    } catch (error: any) {
        if (error instanceof AppError) return next(error);
        if (error.message === "Membership not found") {
            return next(new AppError("Membresía no encontrada para este usuario.", 404, "MEMBERSHIP_NOT_FOUND"));
        }
        next(error);
    }
};

/**
 * GET /api/v1/membership/benefits
 * Obtiene los beneficios del nivel de membresía actual
 */
export const getMembershipBenefits = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const userId = req.userId;
        if (!userId) throw new AppError("Sesión requerida.", 401, "UNAUTHORIZED");

        const benefits = await MembershipService.getBenefitsByUserId(userId);
        return successResponse(res, benefits, 200);
    } catch (error: any) {
        if (error instanceof AppError) return next(error);
        if (error.message === "Membership not found") {
            return next(new AppError("Membresía no encontrada para este usuario.", 404, "MEMBERSHIP_NOT_FOUND"));
        }
        next(error);
    }
};


/**
 * POST /api/v1/membership/discount/calculate
 * Calcula el descuento aplicable según el nivel de membresía del usuario
 */
export const postCalculateMembershipDiscount = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const userId = req.userId;
        if (!userId) throw new AppError("Sesión requerida.", 401, "UNAUTHORIZED");

        const { valid, error, data } = validateCalculateDiscountDto(req.body);
        if (!valid) throw new AppError(error!, 400, "VALIDATION_ERROR");

        const result = await MembershipService.calculateDiscount(userId, data);
        return successResponse(res, result, 200);
    } catch (error: any) {
        if (error instanceof AppError) return next(error);
        if (error.message === "Membership not found") {
            return next(new AppError("Membresía no encontrada para este usuario.", 404, "MEMBERSHIP_NOT_FOUND"));
        }
        next(error);
    }
};

/**
 * GET /api/v1/membership/qr
 * Obtiene (o genera si es la primera vez) el código QR de membresía
 * del usuario autenticado 
 */
export const getMembershipQr = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const userId = req.userId;
        if (!userId) throw new AppError("Sesión requerida.", 401, "UNAUTHORIZED");

        const result = await MembershipService.getOrCreateQr(userId);
        return successResponse(res, result, 200);
    } catch (error) {
        next(error);
    }
};


