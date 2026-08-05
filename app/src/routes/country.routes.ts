import { getCountries } from "../controllers/country.controller";
import { Router } from "express";




const router = Router();


/**
 * GET /countries
 * --------------
 * Obtiene la lista de países disponibles en el sistema.
 * Response:
 *  - 200 OK: Devuelve un array de países en formato JSON.
 *  - 500 Internal Server Error: En caso de error en la consulta.
 *
 * @swagger
 * /api/countries:
 *   get:
 *     summary: Obtener todos los países
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: Lista de países obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - "Colombia"
 *               - "Estados Unidos"
 *               - "Canadá"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener los países"
 */     



router.get("/", getCountries);

export default router;