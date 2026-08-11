import repository from "../repositories/movie-details.repository";
import Movie from "../models/movie.model";
import Showtime from "../models/showtime.model";

class MovieService{

    async getMovieDetail(id: number): Promise<Movie | null>{
        const movie = await repository.findMovieDetailById(id);
        if(!movie) throw new Error("Movie not found");
        return movie;
    }

    async getFutureShowtimes(movieId:number, cityId:number): Promise<Showtime[]>{
        const showtimes = await repository.findFutureShowtimesByMovieId(movieId, cityId);
        return showtimes;
    }
}

export default new MovieService();