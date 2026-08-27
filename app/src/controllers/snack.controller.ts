import { NextFunction, Request, Response } from "express";
import { successResponse } from "../utils/apiResponse";
import { getActiveSnacks, getActiveCategories } from "../services/snack.service";

export const listSnacks = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
        const search = req.query.search ? String(req.query.search) : undefined;

        const snacks = await getActiveSnacks({ categoryId, search });
        return successResponse(res, snacks, 200);
    } catch (error) {
        next(error);
    }
};

export const listSnackCategories = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const categories = await getActiveCategories();
        return successResponse(res, categories, 200);
    } catch (error) {
        next(error);
    }
};