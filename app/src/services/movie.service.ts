import repository from "../repositories/movie.repository";
import Movie from "../models/movie.model";

class MovieService{

    async getMovieDetail(id: number): Promise<Movie | null>{
        const movie = await repository.findMovieDetailById(id);
        if(!movie) throw new Error("Movie not found");
        return movie;
    }
}

export default new MovieService();