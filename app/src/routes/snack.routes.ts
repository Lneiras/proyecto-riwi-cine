import { Router } from "express";
import { listSnacks, listSnackCategories } from "../controllers/snack.controller";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Snack:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 4 }
 *         name: { type: string, example: Combo Grande }
 *         description: { type: string, nullable: true }
 *         price: { type: number, example: 20000 }
 *         effectivePrice: { type: number, example: 18000, description: Precio con promoción vigente aplicada }
 *         imageUrl: { type: string, nullable: true }
 *         category: { type: object, nullable: true, properties: { id: { type: integer }, name: { type: string } } }
 *         stock: { type: integer, example: 12 }
 *         available: { type: boolean, example: true }
 */

/**
 * @swagger
 * /api/v1/snacks:
 *   get:
 *     summary: Catálogo público de productos de confitería activos
 *     tags: [Snacks]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema: { type: integer }
 *         description: Filtra por ID de categoría
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Búsqueda parcial por nombre del producto
 *     responses:
 *       200:
 *         description: Listado obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Snack' }
 *       500: { description: Error interno del servidor }
 */
router.get("/", listSnacks);

/**
 * @swagger
 * /api/v1/snacks/categories:
 *   get:
 *     summary: Categorías activas de confitería
 *     tags: [Snacks]
 *     responses:
 *       200: { description: Listado de categorías obtenido correctamente }
 *       500: { description: Error interno del servidor }
 */
router.get("/categories", listSnackCategories);

export default router;