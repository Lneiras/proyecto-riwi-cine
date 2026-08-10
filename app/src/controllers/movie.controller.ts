

// app/src/controllers/movie.controller.ts

import { Request, Response, NextFunction } from "express";
import { MovieService } from "../services/movie.service";
import { parseMovieFilters, parseDateRange } from "../dto/movie-filter.dto";
import { successResponse } from "../utils/apiResponse";

export class MovieController {
    static async getWeekly(req: Request, res: Response, next: NextFunction) {
        try {
        const filters = parseMovieFilters(req.query);
        const movies = await MovieService.getWeeklyCartelera(filters);
        return successResponse(res, movies, 200, { count: movies.length });
        } catch (err) {
        next(err);
        }
    }

    static async getToday(req: Request, res: Response, next: NextFunction) {
        try {
        const filters = parseMovieFilters(req.query);
        const movies = await MovieService.getTodayCartelera(filters);
        return successResponse(res, movies, 200, { count: movies.length });
        } catch (err) {
        next(err);
        }
    }

    static async getFilter(req: Request, res: Response, next: NextFunction) {
        try {
        const filters = parseMovieFilters(req.query);
        const { dateFrom, dateTo } = parseDateRange(req.query);
        const movies = await MovieService.getFilteredCartelera(filters, dateFrom, dateTo);
        return successResponse(res, movies, 200, { count: movies.length });
        } catch (err) {
        next(err);
        }
    }
}