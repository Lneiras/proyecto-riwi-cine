

import { MovieRepository } from "../repositories/movie.repository";
import { MovieFilters, PaginationParams } from "../dto/movie-filter.dto";

const PUBLISHED_STATUS = "publicada";
const CARTELERA_WINDOW_DAYS = 6; // hoy + 6 = 7 días totales

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

function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

export class MovieService {
    static async getWeeklyCartelera(filters: MovieFilters, pagination: PaginationParams) {
        const dateFrom = startOfDay(new Date());
        const dateTo = endOfDay(addDays(dateFrom, CARTELERA_WINDOW_DAYS));

    return MovieRepository.findCartelera({ ...filters, dateFrom, dateTo, statusName: PUBLISHED_STATUS, ...pagination });
    }

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

  /** filtros combinables con rango de fecha libre por default coloca 7 días a partir de la fecha ingresada o de "hoy" si no se ingresa fecha */
    static async getFilteredCartelera(filters: MovieFilters, pagination: PaginationParams, dateFrom?: Date, dateTo?: Date) {
        const resolvedFrom = dateFrom ? startOfDay(dateFrom) : startOfDay(new Date());
        // con esto cambiamos la fecha desde la que se genera la busqueda, no se genera 
        // desde un punto fijo (hoy), sino que se hace desde la fecha actualizada al 
        // momento de la consulta
        const resolvedTo = dateTo ? endOfDay(dateTo) : endOfDay(addDays(resolvedFrom, CARTELERA_WINDOW_DAYS));

        return MovieRepository.findCartelera({
            ...filters,
            dateFrom: resolvedFrom,
            dateTo: resolvedTo,
            statusName: PUBLISHED_STATUS,
            ...pagination,
        });
    }
}