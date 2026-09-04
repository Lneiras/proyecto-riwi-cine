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
import { IMovieRepository } from "./interfaces/movie-details.repository.interface";

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
        return await Movie.findAll({
            where: {
                id: {[Op.ne]: excludeMovieId},
                genreId,
                statusId: 2,
            },
            include:[
                {
                    model: MovieGenre,
                }
            ],
            limit: 5,
        });

    }
}

export default new MovieRepository();