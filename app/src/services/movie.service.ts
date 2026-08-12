

import { MovieRepository } from "../repositories/movie.repository";
import { MovieFilters, PaginationParams } from "../dto/movie-filter.dto";

const PUBLISHED_STATUS = "publicada";

function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function endOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

export class MovieService {
  /** cartelera de los próximos 7 días */
    static async getWeeklyCartelera(filters: MovieFilters, pagination: PaginationParams) {
        const dateFrom = startOfDay(new Date());
        const dateTo = endOfDay(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000));

        return MovieRepository.findCartelera({ ...filters, dateFrom, dateTo, statusName: PUBLISHED_STATUS, ...pagination });
    }

  /** Cartelera de únicamente hoy. */
    static async getTodayCartelera(filters: MovieFilters, pagination: PaginationParams) {
        const now = new Date();
        return MovieRepository.findCartelera({
            ...filters,
            dateFrom: now,
            dateTo: endOfDay(now),
            statusName: PUBLISHED_STATUS,
            ...pagination,
        });
    }

  /** filtros combinables con rango de fecha libre (default: próximos 7 días). */
    static async getFilteredCartelera(filters: MovieFilters, pagination: PaginationParams, dateFrom?: Date, dateTo?: Date) {
    const resolvedFrom = dateFrom ? startOfDay(dateFrom) : startOfDay(new Date());
    const resolvedTo = dateTo ? endOfDay(dateTo) : endOfDay(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000));

        return MovieRepository.findCartelera({
            ...filters,
            dateFrom: resolvedFrom,
            dateTo: resolvedTo,
            statusName: PUBLISHED_STATUS,
            ...pagination,
        });
    }
}