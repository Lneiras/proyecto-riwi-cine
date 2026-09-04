import { getCountries, getCountryById } from "../controllers/country.controller";
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

/**
 * GET /countries/:id
 * -------------------
 * Obtiene un país específico por su ID.
 * Response:
 *  - 200 OK: Devuelve el país en formato JSON.
 *  - 404 Not Found: Si no se encuentra el país con el ID proporcionado.
 *  - 500 Internal Server Error: En caso de error en la consulta.
 *
 * @swagger
 * /api/countries/{id}:
 *   get:
 *     summary: Obtener un país por su ID
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     description: ID del país a obtener
 *     responses:
 *       200:
 *         description: País obtenido exitosamente
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               name: "Colombia"
 *       404:
 *         description: País no encontrado
 *         content:
 *           application/json:
 *             example:
 *               error: "Country not found"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener el país"
*/
router.get("/:id", getCountryById);

export default router;