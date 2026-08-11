
/**
 * Filtros combinables de cartelera mas la paginación 
 * Validación manual  — cada campo es opcional excepto
 * cuando se indica lo contrario.
 */

import { AppError } from "../utils/apiResponse";


export interface MovieFilters {
    cityId?: number;
    genreId?: number;
    formatId?: number;
    languageId?: number;
    rating?: string;
}

export interface PaginationParams {
    page: number;
    limit: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

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

/** Rango de fechas explícito para /movies/filter (opcional; si no viene, el service usa el default de 7 días). */
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

/** Paginación (Task 3): page/limit con tope máximo para evitar abuso. */
export function parsePagination(query: Record<string, unknown>): PaginationParams {
    const page = query.page ? Number(query.page) : DEFAULT_PAGE;
    const limit = query.limit ? Number(query.limit) : DEFAULT_LIMIT;

    if (!Number.isInteger(page) || page < 1) {
        throw new AppError('El parámetro "page" debe ser un entero mayor o igual a 1.', 400, "INVALID_QUERY_PARAM");
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new AppError(`El parámetro "limit" debe ser un entero entre 1 y ${MAX_LIMIT}.`, 400, "INVALID_QUERY_PARAM");
    }

    return { page, limit };
}