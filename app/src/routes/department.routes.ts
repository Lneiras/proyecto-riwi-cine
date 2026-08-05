import { getDepartments } from "../controllers/department.controller";
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

export default router;