import { Movie, Showtime } from "../../models";


export interface IMovieRepository {

    findMovieDetailById(id:number): Promise<Movie | null>;
    findFutureShowtimesByMovieId(movieId:number, cityId:number): Promise<Showtime[]>;
    findSimilarMovies(genreId:number, excludeMovieId:number): Promise<Movie[]>;
}