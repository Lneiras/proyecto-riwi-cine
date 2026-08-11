import {
    Movie,
    MovieGenre,
    MovieStatus,
    Showtime,
    Format,
    Language,
    Room,
    Cinema
} from "../models";

import { Op } from "sequelize";

class MovieRepository {
    async findMovieDetailById(id: number): Promise<Movie | null> {
        return await Movie.findByPk(id, {
            include: [{
                model: MovieGenre
            },
            {
                model: MovieStatus
            }]
        }
        );
    }

    async findFutureShowtimesByMovieId(movieId: number, cityId: number): Promise<Showtime[]> {
        return await Showtime.findAll({
            where: {
                movieId,
                dateTime: { [Op.gte]: new Date() },
            },
            order: [["dateTime", "ASC"]],
            include: [
                {
                    model: Format,
                },
                {
                    model: Language,
                },
                {
                    model: Room,
                    required: true,
                    include: [{
                        model: Cinema,
                        required: true,
                        where: {
                            cityId
                        }
                    }]
                }
            ]
        });

    }

    async findSimilarMovies(genreId: number, excludeMovieId: number): Promise<Movie[]> {
        const movies = await Movie.findAll({
            where: {
                genreId,
                id: { [Op.ne]: excludeMovieId },
            },
            limit: 5,
        })

        const genre = await MovieGenre.findByPk(genreId);

        for (const movie of movies) {
            (movie as any).dataValues.genre = genre;
        }

        return movies;

    };




}

export default new MovieRepository();