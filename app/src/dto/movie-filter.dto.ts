
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

/** parsea la fecha para que corra en hora local y no en UTC lo que podria incurrir en errores al momento de filtrar*/
function parseISODateOnly(value: string, fieldName: "dateFrom" | "dateTo"): Date {
    const trimmed = value.trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

    if (!match) {
        throw new AppError(`El parámetro "${fieldName}" no es una fecha válida (usa formato ISO: YYYY-MM-DD).`, 400, "INVALID_QUERY_PARAM");
    }

    const year = Number(match[1]);
    const month = Number(match[2]); // 1-12
    const day = Number(match[3]); // 1-31

    const date = new Date(year, month - 1, day); // esto genera la hora local evitando la UTC

  // 
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        throw new AppError(`El parámetro "${fieldName}" no es una fecha válida (usa formato ISO: YYYY-MM-DD).`, 400, "INVALID_QUERY_PARAM");
    }

    return date;
}

export function parseDateRange(query: Record<string, unknown>): { dateFrom?: Date; dateTo?: Date } {
    const rawDateFrom = typeof query.dateFrom === "string" ? query.dateFrom : undefined;
    const rawDateTo = typeof query.dateTo === "string" ? query.dateTo : undefined;

    const dateFrom = rawDateFrom ? parseISODateOnly(rawDateFrom, "dateFrom") : undefined;
    const dateTo = rawDateTo ? parseISODateOnly(rawDateTo, "dateTo") : undefined;

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