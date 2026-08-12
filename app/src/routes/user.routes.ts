// app/src/routes/user.routes.ts

/**
 * Rutas de Usuario
 * ----------------
 * Este archivo define las rutas HTTP relacionadas con la entidad `User`.
 * 
 * Endpoints disponibles:
 *  - `POST /users/` : Crear un nuevo usuario.
 *  - `GET /users/`  : Obtener todos los usuarios registrados.
 * 
 * Cada ruta se conecta con su respectivo controlador.
 */

import { Router } from "express";
import { createUser, getUsers, Auth, health, changeUserLocation } from "../controllers/user.controller";
import { getUsersbyId } from "../controllers/user.controller";



const router = Router();

/**
 * POST /
 * -----
 * Crea un nuevo usuario en la base de datos.
 * 
 * Request Body:
 *  - `name`: string (obligatorio)
 *  - `email`: string (obligatorio, único)
 * 
 * Response:
 *  - 201 Created: Retorna el usuario creado en formato JSON.
 *  - 500 Internal Server Error: En caso de error en la creación.
 * 
 * 
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               id: 3
 *               name: "John Doe"
 *               email: "john.doe@example.com"
 *               password: "hashed_password"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             example:
 *               error: "El correo ya existe"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "No se pudo crear el usuario"
 */
router.post("/", createUser);

/**
 * GET /
 * ----
 * Obtiene la lista completa de usuarios registrados en la base de datos.
 * 
 * Response:
 *  - 200 OK: Devuelve un array de usuarios en formato JSON.
 * 
 * 
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "John Doe"
 *                 email: "john.doe@example.com"
 *                 password: "hashed_password"
 *               - id: 2
 *                 name: "Jane Doe"
 *                 email: "jane.doe@example.com"
 *                 password: "hashed_password"
 *       400:
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             example:
 *               error: "Parámetros incorrectos"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener los usuarios"
 */
router.get("/", getUsers);



/**
 * POST /
 * -----
 * Verifica si un usuario puede autenticarse en el sistema.
 * 
 * Request Body:
 *  - `email`: string (obligatorio, único)
 *  - `password`: string (obligatorio)
 * 
 * Response:
 *  - 200 OK: Retorna el usuario autenticado en formato JSON.
 *  - 401 Unauthorized: En caso de credenciales inválidas.
 *  - 500 Internal Server Error: En caso de error en la autenticación.
 *
 * @swagger
 * /api/users/auth:
 *   post:
 *     summary: Autenticación de usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"  
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Usuario autenticado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               id: 3
 *               name: "John Doe"
 *               email: "john.doe@example.com"
 *               password: "hashed_password"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             example:
 *               error: "El correo o la contraseña son incorrectos"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "No se pudo autenticar el usuario"
 */



router.post("/auth", Auth)

/**
 * @swagger
 * /api/users/location:
 *   patch:
 *     summary: Cambia la ubicación (ciudad) de un usuario autenticado
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - location
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               location:
 *                 type: string
 *                 description: Nombre de la ciudad
 *                 example: Barranquilla
 *     responses:
 *       200:
 *         description: Ubicación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   example: john.doe@example.com
 *                 location:
 *                   type: integer
 *                   example: 5
 *       400:
 *         description: Faltan campos requeridos (email, password o location)
 *       401:
 *         description: Credenciales inválidas o usuario no autenticado
 *       404:
 *         description: Ciudad no encontrada
 *       500:
 *         description: Error interno del servidor
 */

router.patch("/location", changeUserLocation)



/**
 * POST /v1/health
 * -----------------
 * Endpoint para verificar la salud del servicio.
 * 
 * Response:
 *  - 200 OK: Retorna un mensaje indicando que el servicio está saludable.
 *  - 500 Internal Server Error: En caso de error en la verificación de salud.
 *
 * @swagger
 * /api/users/v1/health:
 *   post:
 *     summary: Verificar la salud del servicio
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Servicio saludable
 *         content:
 *           application/json:
 *             example:
 *               message: "UserService is healthy"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al verificar la salud del servicio"
 */         


router.post("/v1/health", health)


/**
 * GET /:id
 * ---------
 * Obtiene un usuario específico por su ID.
 * Response:
 *  - 200 OK: Devuelve el usuario encontrado en formato JSON.
 *  - 404 Not Found: En caso de que no se encuentre el usuario.
 *  - 500 Internal Server Error: En caso de error en la consulta.
 *
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a obtener
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             example:
 *               id: 3
 *               name: "John Doe"
 *               email: "john.doe@example.com"
 *               password: "hashed_password"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             example:
 *               error: "Usuario no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener el usuario"
 */


router.get("/:id", getUsersbyId);








export default router;





