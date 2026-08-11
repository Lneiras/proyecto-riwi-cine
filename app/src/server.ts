// app/src/server.ts

/**
 * Se encarga únicamente de configurar la aplicación Express: middlewares, rutas, swagger, etc.
 * No arranca el servidor ni toca la base de datos.
 * Esto hace que la aplicación sea testeable fácilmente, porque podemos importar app en nuestros tests sin necesidad de levantar el servidor real ni conectarse a la BD.
*/

import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import countryRoutes from "./routes/country.routes";
import userRoutes from "./routes/user.routes";
import departmentRoutes from "./routes/department.routes";
import citiesRoutes from "./routes/cities.routes";
import movieRoutes from "./routes/movie.routes";


const app = express();

app.use(express.json());

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/cities", citiesRoutes);
app.use("/api/movies", movieRoutes);
// Swagger
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;