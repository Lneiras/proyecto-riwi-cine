

import { MovieRepository } from "../repositories/movie.repository";
import { MovieFilters } from "../dto/movie-filter.dto";

/** Único lugar del código donde vive el valor literal "publicada" (RN implícita de HU-003). */
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
  /** HU-003 Escenario 1: cartelera de los próximos 7 días. */
    static async getWeeklyCartelera(filters: MovieFilters) {
        const dateFrom = startOfDay(new Date());
        const dateTo = endOfDay(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)); // hoy + 6 días = 7 días totales

        return MovieRepository.findCartelera({ ...filters, dateFrom, dateTo, statusName: PUBLISHED_STATUS });
    }

    /** Cartelera de únicamente hoy. */
    static async getTodayCartelera(filters: MovieFilters) {
        const now = new Date();
        return MovieRepository.findCartelera({
        ...filters,
        dateFrom: now, // solo funciones que aún no han iniciado (no las de horas ya pasadas)
        dateTo: endOfDay(now),
        statusName: PUBLISHED_STATUS,
        });
    }

    /** HU-003 Escenario 2: filtros combinables con rango de fecha libre (default: próximos 7 días). */
    static async getFilteredCartelera(filters: MovieFilters, dateFrom?: Date, dateTo?: Date) {
        const resolvedFrom = dateFrom ? startOfDay(dateFrom) : startOfDay(new Date());
        const resolvedTo = dateTo ? endOfDay(dateTo) : endOfDay(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000));

        return MovieRepository.findCartelera({ ...filters, dateFrom: resolvedFrom, dateTo: resolvedTo, statusName: PUBLISHED_STATUS });
    }
}