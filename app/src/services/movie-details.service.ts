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

    async getFunctionById(id:number): Promise<Showtime>{
        const showtime = await repository.findFunctionById(id);
        if(!showtime){
            throw new Error("Showtime not found");
        };
        return showtime
    }

    async getFunctionPrice(id:number){
        const showtime = await repository.findFunctionById(id);
        if(!showtime){
            throw new Error("Showtime not found");
        };
        
        let finalPrice = Number(showtime.basePrice);

        const format = (showtime as any).format?.name?.toUpperCase();

        if(format === "3D") finalPrice += 5000
        if(format === "4DX") finalPrice += 10000
        if(format === "IMAX") finalPrice += 15000

        const roomName = (showtime as any).room?.name?.toUpperCase() || "";
        if (roomName.includes("VIP")){
            finalPrice += 8000;
        }

        const hour = new Date(showtime.dateTime).getHours();
        if (hour >= 18) {
            finalPrice += 3000;
        }

        return {
            id: id,
            basePrice: showtime.basePrice,
            finalPrice
        }
    }
}

export default new MovieService();