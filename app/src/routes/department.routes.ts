import { getDepartments, getDepartmentsByCountryId } from "../controllers/department.controller";
import { Router } from "express";


const router = Router();


/**
 * GET /departments
 * --------------
 * Obtiene la lista de departamentos disponibles en el sistema.
 * Response:
 *  - 200 OK: Devuelve un array de departamentos en formato JSON.
 *  - 500 Internal Server Error: En caso de error en la consulta.
 *
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Obtener todos los departamentos
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: Lista de departamentos obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - "Cordoba"
 *               - "Antioquia"
 *               - "Cundinamarca"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener los departamentos"
 */



router.get("/", getDepartments);


/**
 * GET /departments/:countryId
 * --------------
 * Obtiene la lista de departamentos disponibles en el sistema por país.
 * Response:
 *  - 200 OK: Devuelve un array de departamentos en formato JSON.
 *  - 500 Internal Server Error: En caso de error en la consulta.
 *
 * @swagger
 * /api/departments/{countryId}:
 *   get:
 *     summary: Obtener todos los departamentos por país
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: countryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del país para filtrar los departamentos
 *     responses:
 *       200:
 *         description: Lista de departamentos obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - "Cordoba"
 *               - "Antioquia"
 *               - "Cundinamarca"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener los departamentos"
 */


router.get("/:countryId", getDepartmentsByCountryId);

export default router;