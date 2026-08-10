import { Request, Response } from "express";
import DepartmentService from "../services/department.service";

/**
 * Controlador para obtener la lista de departamentos.
 *
 * @param _req - Objeto de solicitud HTTP (no se utiliza en esta función).
 * @param res - Objeto de respuesta HTTP.
 * @returns Una promesa que resuelve con la respuesta HTTP.
 */
export const getDepartments = async (_req: Request, res: Response): Promise<Response> => {

    try {

        const departments = await DepartmentService.getAllDepartments();

        if (!departments) {
            res.status(404).json({error: "There's no departments found"})
        }

        return res.status(200).json(departments);

    } catch (error: any) {

        return res.status(500).json({
            error: error.message
        });

    }

};

export const getDepartmentById = async(req: Request, res: Response): Promise<Response> => {
    try {
        const {id} = req.params;

        const department = await DepartmentService.getDepartmentById(parseInt(id))

        if (!department) {
            res.status(404).json({error: "That city doesn't exist or is not available"})
        }

        return res.status(200).json(department)
        
    } catch (error: any) {
        return res.status(500).json({
            error: error.message
        });
    } 
}