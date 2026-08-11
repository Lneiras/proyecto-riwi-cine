import {
    Movie,
    MovieGenre,
    MovieStatus,
    Showtime,
    Format,
    Language,
    Room,
    Cinema
} from  "../models";

import {Op} from "sequelize";

class MovieRepository {
    async findMovieDetailById(id:number): Promise<Movie | null> {
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
    // 1. Cines que están en la ciudad seleccionada
    const cinemasInCity = await Cinema.findAll({ where: { cityId } });
    const cinemaIds = cinemasInCity.map((cinema) => cinema.id);

    if (cinemaIds.length === 0) return []; // no hay cines en esa ciudad

    // 2. Salas que pertenecen a esos cines
    const roomsInCity = await Room.findAll({ where: { cinemaId: { [Op.in]: cinemaIds } } });
    const roomIds = roomsInCity.map((room) => room.id);

    if (roomIds.length === 0) return []; // no hay salas registradas en esos cines

    // 3. Funciones futuras, de esta película, solo en esas salas
    const showtimes = await Showtime.findAll({
        where: {
            movieId,
            dateTime: { [Op.gte]: new Date() },
            roomId: { [Op.in]: roomIds },
        },
        order: [["dateTime", "ASC"]],
    });

    for (const showtime of showtimes) {
        const format = await Format.findByPk(showtime.formatId);
        const language = await Language.findByPk(showtime.languageId);
        const room = await Room.findByPk(showtime.roomId);
        const cinema = room ? await Cinema.findByPk(room.cinemaId) : null;

        (showtime as any).dataValues.format = format;
        (showtime as any).dataValues.language = language;
        (showtime as any).dataValues.room = room;
        (showtime as any).dataValues.cinema = cinema;
    }

    return showtimes;
}

    async findSimilarMovies(genreId:number, excludeMovieId:number): Promise<Movie[]>{
        const movies = await Movie.findAll({
            where:{
                genreId,
                id:{[Op.ne]: excludeMovieId},
            },
            limit: 5,
        })

        const genre = await MovieGenre.findByPk(genreId);

        for(const movie of movies){
            (movie as any).dataValues.genre = genre;
        }

        return movies;

    };

    
    
    
}

export default new MovieRepository();