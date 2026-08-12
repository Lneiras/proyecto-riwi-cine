import { Movie, Showtime } from "../../models";

export interface IMovieService {
    getMovieDetail(id:number):Promise<Movie>;
    getFutureShowtimes(id: number, city:number):Promise<Showtime[]>;
    getMovieRecommendations(id:number):Promise<Movie[]>
}
