import { Request, Response } from "express";
import departmentService from "../services/department.service";

/**
 * Controlador para obtener la lista de departamentos.
 *
 * @param _req - Objeto de solicitud HTTP (no se utiliza en esta función).
 * @param res - Objeto de respuesta HTTP.
 * @returns Una promesa que resuelve con la respuesta HTTP.
 */
export const getDepartments = async (_req: Request, res: Response): Promise<Response> => {

    try {

        const departments = await departmentService.findDepartments();

        return res.status(200).json(departments);

    } catch (error: any) {

        return res.status(500).json({
            error: error.message
        });

    }

};