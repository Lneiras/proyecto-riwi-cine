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
        const movie = await Movie.findByPk(id);
        if(!movie){
            return null;
        }

        const movieGenre = await MovieGenre.findByPk(movie.genreId);
        const movieStatus = await MovieStatus.findByPk(movie.statusId);
        
        (movie as any).datavalues.genre = movieGenre;
        (movie as any).dataValues.status = movieStatus;

        return movie;
    }


    
}



        