import { getAllCities, getCityById } from '../controllers/cities.controller';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/cities:
 *   get:
 *     summary: Obtener todas las ciudades
 *     tags: [Cities]
 *     responses:
 *       200:
 *         description: Lista de ciudades obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "Bogotá"
 *               - id: 2
 *                 name: "Medellín"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener las ciudades"
 */

router.get('/', getAllCities);

/**
 * @swagger
 *  /api/cities/{id}:
 *   get:
 *     summary: Obtener una ciudad por su ID
 *     tags: [Cities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     description: ID de la ciudad a obtener
 *     responses:
 *       200:
 *         description: Ciudad obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               name: "Bogotá"
 *       404:
 *         description: Ciudad no encontrada
 *         content:
 *           application/json:
 *             example:
 *               error: "City not found"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener la ciudad"
 */
router.get('/:id', getCityById);

export default router;
