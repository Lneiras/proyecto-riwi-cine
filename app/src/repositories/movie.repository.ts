// app/src/repositories/movie.repository.ts

/**
 * Repository de Cartelera
 * Encapsula los queries de Sequelize para el HU3. No conoce reglas de
 * negocio (ej. qué significa "publicada") — eso lo decide el service.
 */

import { Op, WhereOptions } from "sequelize";
import { Movie, MovieGenre, MovieStatus, Showtime, Room, Cinema, Format, Language } from "../models";
import { MovieFilters } from "../dto/movie-filter.dto";

interface CarteleraQueryParams extends MovieFilters {
    dateFrom: Date;
    dateTo: Date;
    statusName: string;
    page: number;
    limit: number;
}

export class MovieRepository {
  /** Paso 1: IDs de películas que cumplen los filtros, ya paginados. */
    private static async findMatchingMovieIds(params: CarteleraQueryParams): Promise<{ ids: number[]; total: number }> {
        const { cityId, genreId, formatId, languageId, rating, dateFrom, dateTo, statusName, page, limit } = params;

        const showtimeWhere: WhereOptions = { dateTime: { [Op.between]: [dateFrom, dateTo] } };
        if (formatId) showtimeWhere.formatId = formatId;
        if (languageId) showtimeWhere.languageId = languageId;

        const movieWhere: WhereOptions = {};
        if (genreId) movieWhere.genreId = genreId;
        if (rating) movieWhere.rating = rating;

        const sharedIncludes = [
            { model: MovieStatus, attributes: [] as string[], where: { name: statusName }, required: true },
            {
                model: Showtime,
                attributes: [] as string[],
                required: true,
                where: showtimeWhere,
                include: [
                {
                    model: Room,
                    attributes: [] as string[],
                    required: true,
                    include: [{ model: Cinema, attributes: [] as string[], required: true, where: cityId ? { cityId } : undefined }],
                },
            ],
        },
    ];

        const totalRows = await Movie.findAll({
            attributes: ["id"],
            where: movieWhere,
            include: sharedIncludes,
            group: ["Movie.id"],
            subQuery: false,
        });

            const pageRows = await Movie.findAll({
                attributes: ["id", "title"],
                where: movieWhere,
                include: sharedIncludes,
                group: ["Movie.id", "Movie.title"],
                order: [["title", "ASC"]],
                limit,
                offset: (page - 1) * limit,
                subQuery: false,
            });

            return { ids: pageRows.map((m) => m.id), total: totalRows.length };
        }

    /** Detalle completo solo para los IDs ya elegidos. */
        private static async findFullMoviesByIds(ids: number[]): Promise<Movie[]> {
            if (ids.length === 0) return [];

            return Movie.findAll({
                where: { id: ids },
                include: [
                    MovieGenre,
                    MovieStatus,
                    {
                        model: Showtime,
                        include: [{ model: Room, include: [Cinema] }, Format, Language],
                        separate: true,
                        order: [["dateTime", "ASC"]],
                    },
                ],
                order: [["title", "ASC"]],
                });
        }

        static async findCartelera(params: CarteleraQueryParams): Promise<{ movies: Movie[]; total: number }> {
            const { ids, total } = await this.findMatchingMovieIds(params);
            const movies = await this.findFullMoviesByIds(ids);
            return { movies, total };
        }
    }