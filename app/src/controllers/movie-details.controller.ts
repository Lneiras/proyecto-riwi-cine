import {Request, Response} from "express";
import movieService from "../services/movie-details.service";

export const getMovieById = async (req: Request, res: Response) =>{
    try {
        const {id} = req.params;
        const movie = await movieService.getMovieDetail(parseInt(id));
        res.status(200).json(movie);
    } catch (error: any) {
        res.status(404).json({error: error.message})
    }
}