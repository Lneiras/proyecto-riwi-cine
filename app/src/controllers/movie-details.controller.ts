import {Request, Response} from "express";
import movieService from "../services/movie-details.service";
import { error } from "console";

export const getMovieById = async (req: Request, res: Response) =>{
    try {
        const {id} = req.params;
        const movie = await movieService.getMovieDetail(parseInt(id));
        return res.status(200).json(movie);
    } catch (error: any) {
        return res.status(404).json({error: error.message})
    }
}

export const getFutureShowtimes = async (req: Request, res: Response) =>{
    try {
        const {id} = req.params;
        const {cityId} = req.query
        if(!cityId){
            return res.status(400).json({error: "cityId is required as a query param"})
        }
        const showtimes = await movieService.getFutureShowtimes(parseInt(id), parseInt(cityId as string));
        return res.status(200).json(showtimes);
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
} 

export const getMovieRecommendations = async (req: Request, res: Response) =>{
    try {
        const {id} = req.params;
        const recommendations = await movieService.getMovieRecommendations(parseInt(id));
        return res.status(200).json(recommendations);
    } catch (error: any) {
        return res.status(400).json({error: error.message})
    }
}

export const getFunctionById = async (req: Request, res: Response) =>{
    try {
        const {id} = req.params;
        const result = await movieService.getFunctionById(parseInt(id));
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(404).json({message: error.message});
    }
}

export const getFunctionPrice = async (req: Request, res: Response) =>{
    try {
        const {id} = req.params;
        const result = await movieService.getFunctionPrice(parseInt(id));
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(404).json({message: error.message});
    }
}