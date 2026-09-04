

import { Request, Response, NextFunction } from "express";
import { MovieService } from "../services/movie.service";
import { parseMovieFilters, parseDateRange, parsePagination } from "../dto/movie-filter.dto";
import { successResponse } from "../utils/apiResponse";

function buildMeta(pagination: { page: number; limit: number }, total: number) {
    return {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
    };
}

export class MovieController {
    static async getWeekly(req: Request, res: Response, next: NextFunction) {
        try {
        const filters = parseMovieFilters(req.query);
        const pagination = parsePagination(req.query);
        const { movies, total } = await MovieService.getWeeklyCartelera(filters, pagination);
        return successResponse(res, movies, 200, buildMeta(pagination, total));
        } catch (err) {
        next(err);
        }
    }

    static async getToday(req: Request, res: Response, next: NextFunction) {
        try {
        const filters = parseMovieFilters(req.query);
        const pagination = parsePagination(req.query);
        const { movies, total } = await MovieService.getTodayCartelera(filters, pagination);
        return successResponse(res, movies, 200, buildMeta(pagination, total));
        } catch (err) {
        next(err);
        }
    }

    static async getFilter(req: Request, res: Response, next: NextFunction) {
        try {
        const filters = parseMovieFilters(req.query);
        const pagination = parsePagination(req.query);
        const { dateFrom, dateTo } = parseDateRange(req.query);
        const { movies, total } = await MovieService.getFilteredCartelera(filters, pagination, dateFrom, dateTo);
        return successResponse(res, movies, 200, buildMeta(pagination, total));
        } catch (err) {
        next(err);
        }
    }
}