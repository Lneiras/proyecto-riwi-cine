import { Request, Response } from "express";
import functionService from "../services/function.service"

function isValidId(id: string): boolean {
    return /^\d+$/.test(id)
}

function handleFunctionError(error: any, res: Response){
    if(error.message = "Function not found"){
        return res.status(404).json({message: "Funcion no encontrada"});
    }
    if(error.message = "Function already started"){
        return res.status(409).json({message: "Esta funcion ya inició y no puede seleccionarse"});
    }

    console.error("Error inesperado en function.controller: ", error);
    return res.status(500).json({message: "Error interno del servidor"});
}


export const getFunctionById = async (req: Request, res: Response) =>{
     const {id} = req.params;
        if(!isValidId(id)){
            return res.status(400).json({message: "El id de la funcion debe ser un numero entero"})
        };

    try {
        const result = await functionService.getFunctionById(parseInt(id));
        return res.status(200).json(result);
    } catch (error: any) {
        return handleFunctionError(error, res);
    }
}

export const getFunctionPrice = async (req: Request, res: Response) =>{
    const {id} = req.params;
        if(!isValidId(id)){
            return res.status(400).json({message: "El id de la funcion debe ser un numero entero"})
        };

    try {
        const result = await functionService.getFunctionPrice(parseInt(id));
        return res.status(200).json(result);
    } catch (error: any) {
        return handleFunctionError(error, res);
    }
}