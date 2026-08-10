// app/src/repositories/movie.repository.ts

/**
 * Repository de Cartelera
 * ------------------------
 * Encapsula el query de Sequelize para HU-003. No conoce reglas de
 * negocio (ej. qué significa "publicada") — eso lo decide el service,
 * que le pasa el nombre del estado explícitamente.
 */

import { Op, WhereOptions } from "sequelize";
import { Movie, MovieGenre, MovieStatus, Showtime, Room, Cinema, Format, Language } from "../models";
import { MovieFilters } from "../dto/movie-filter.dto";

interface CarteleraQueryParams extends MovieFilters {
    dateFrom: Date;
    dateTo: Date;
    statusName: string;
}

export class MovieRepository {
    static async findCartelera(params: CarteleraQueryParams): Promise<Movie[]> {
    const { cityId, genreId, formatId, languageId, rating, dateFrom, dateTo, statusName } = params;

    const showtimeWhere: WhereOptions = {
        dateTime: { [Op.between]: [dateFrom, dateTo] },
    };
    if (formatId) showtimeWhere.formatId = formatId;
    if (languageId) showtimeWhere.languageId = languageId;

    const movieWhere: WhereOptions = {};
    if (genreId) movieWhere.genreId = genreId;
    if (rating) movieWhere.rating = rating;

    return Movie.findAll({
        where: movieWhere,
        include: [
            { model: MovieGenre },
            { model: MovieStatus, where: { name: statusName }, required: true },
            {
            model: Showtime,
            required: true, // inner join: solo películas con AL MENOS una función que cumpla los filtros
            where: showtimeWhere,
            include: [
                {
                model: Room,
                required: true,
                include: [
                    {
                    model: Cinema,
                    required: true,
                    // si no filtran por ciudad, igual exige que la sala tenga un cine válido
                    where: cityId ? { cityId } : undefined,
                    },
                ],
                },
                { model: Format },
                { model: Language },
            ],
            order: [["dateTime", "ASC"]],
            },
        ],
        order: [["title", "ASC"]],
        subQuery: false,
        });
    }
}