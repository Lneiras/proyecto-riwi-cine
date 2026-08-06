import { Request, Response } from "express";
import countryService from "../services/country.service";

/**
 * Controlador para obtener la lista de países.
 *
 * @param _req - Objeto de solicitud HTTP (no se utiliza en esta función).
 * @param res - Objeto de respuesta HTTP.
 * @returns Una promesa que resuelve con la respuesta HTTP.
 */
export const getCountries = async (_req: Request, res: Response): Promise<Response> => {

    try {

        const countries = await countryService.findCountries();

        return res.status(200).json(countries);

    } catch (error: any) {

        return res.status(500).json({
            error: error.message
        });

    }

};

export const getCountryById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const country = await countryService.findCountryById(parseInt(id));

        if (!country) {
            return res.status(404).json({ error: "Country not found" });
        }

        return res.status(200).json(country);
    } catch (error: any) {
        return res.status(500).json({
            error: error.message
        });
    }
}

