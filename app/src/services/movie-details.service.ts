import repository from "../repositories/movie-details.repository";
import Movie from "../models/movie.model";
import Showtime from "../models/showtime.model";
import { IMovieService } from "./interfaces/movie-details.service.interface";

class MovieService {

    async getMovieDetail(id:number): Promise<Movie>{
        const movie = await repository.findMovieDetailById(id);
        if(!movie) throw new Error("Movie not found");
        return movie;
    }

    async getFutureShowtimes(movieId:number, cityId:number): Promise<Showtime[]>{
        const showtimes = await repository.findFutureShowtimesByMovieId(movieId, cityId);
        return showtimes;
    }

    async getMovieRecommendations(id:number): Promise<Movie[]>{
        const movie = await repository.findMovieDetailById(id);
        if(!movie) throw new Error("Movie not found");
        return await repository.findSimilarMovies(movie.genreId, id);
    }
}

export default new MovieService();