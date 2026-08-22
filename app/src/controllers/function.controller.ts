import { Request, Response } from "express";
import functionService from "../services/function.service"


export const getFunctionById = async (req: Request, res: Response) =>{
    try {
        const {id} = req.params;
        const result = await functionService.getFunctionById(parseInt(id));
        return res.status(200).json(result);
    } catch (error: any) {
        if (error.message === "Function already started") {
            return res.status(409).json({message: "This function has already started and cannot be selected"})
        }
        return res.status(404).json({message: error.message});
    }
}

export const getFunctionPrice = async (req: Request, res: Response) =>{
    try {
        const {id} = req.params;
        const result = await functionService.getFunctionPrice(parseInt(id));
        return res.status(200).json(result);
    } catch (error: any) {
        if (error.message === "Function already started") {
            return res.status(409).json({message: "This function has already started and cannot be selected"})
        }
        return res.status(404).json({message: error.message});
    }
}