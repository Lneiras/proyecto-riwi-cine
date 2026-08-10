

/**
 * Filtros combinables de cartelera 
 */

import { AppError } from "../utils/apiResponse";

export interface MovieFilters {
    cityId?: number;
    genreId?: number;
    formatId?: number;
    languageId?: number;
    rating?: string;
}

/** Convierte un query param a entero positivo, o undefined si no vino. Lanza si vino pero es inválido. */
function parseOptionalInt(value: unknown, fieldName: string): number | undefined {
    if (value === undefined || value === "") return undefined;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new AppError(`El parámetro "${fieldName}" debe ser un entero positivo.`, 400, "INVALID_QUERY_PARAM");
    }
    return parsed;
}

export function parseMovieFilters(query: Record<string, unknown>): MovieFilters {
    return {
        cityId: parseOptionalInt(query.cityId, "cityId"),
        genreId: parseOptionalInt(query.genreId, "genreId"),
        formatId: parseOptionalInt(query.formatId, "formatId"),
        languageId: parseOptionalInt(query.languageId, "languageId"),
        rating: typeof query.rating === "string" && query.rating.trim() !== "" ? query.rating.trim() : undefined,
    };
}

/** Rango de fechas explícito para /movies/filter */
export function parseDateRange(query: Record<string, unknown>): { dateFrom?: Date; dateTo?: Date } {
    const dateFrom = query.dateFrom ? new Date(query.dateFrom as string) : undefined;
    const dateTo = query.dateTo ? new Date(query.dateTo as string) : undefined;

    if (query.dateFrom && isNaN(dateFrom!.getTime())) {
        throw new AppError('El parámetro "dateFrom" no es una fecha válida (usa formato ISO: YYYY-MM-DD).', 400, "INVALID_QUERY_PARAM");
    }
    if (query.dateTo && isNaN(dateTo!.getTime())) {
        throw new AppError('El parámetro "dateTo" no es una fecha válida (usa formato ISO: YYYY-MM-DD).', 400, "INVALID_QUERY_PARAM");
    }
    if (dateFrom && dateTo && dateFrom > dateTo) {
        throw new AppError('"dateFrom" no puede ser posterior a "dateTo".', 400, "INVALID_DATE_RANGE");
    }

    return { dateFrom, dateTo };
}