import CityService from '../services/cities.service';
import { Request, Response } from 'express';

export const getAllCities = async (_req: Request, res: Response): Promise<Response> => {
    try {
        const cities = await CityService.getAllCities();

        if (!cities || cities.length === 0) {
            return res.status(200).json({ message: "No cities found" });
        }

        // si en el frontend meten una ciudad que no existe en la base de datos:
        const invalidCities = cities.filter((city) => !city.id);

        if (invalidCities.length > 0) {
            return res.status(400).json({ error: "Some cities are invalid", invalidCities });
        }

        return res.status(200).json(cities);
    } catch (error: any) {
        return res.status(500).json({
            error: error.message
        });
    }   
}

export const getCityById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const city = await CityService.getCityById(parseInt(id));

        if (!city) {
            return res.status(404).json({ error: "City not found" });
        }

        return res.status(200).json(city);
    } catch (error: any) {
        return res.status(500).json({
            error: error.message
        });
    }
}

export const findCitiesByDepartmentId = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { departmentId } = req.params;
        const cities = await CityService.findCitiesByDepartmentId(parseInt(departmentId));

        if (!cities || cities.length === 0) {
            return res.status(404).json({ error: "No cities found for this department" });
        }

        return res.status(200).json(cities);
    } catch (error: any) {
        return res.status(500).json({
            error: error.message
        });
    }
}

