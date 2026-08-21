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
import authRoutes from "./routes/auth.routes";
import membershipRoutes from "./routes/membership.routes";
import departmentRoutes from "./routes/department.routes";
import citiesRoutes from "./routes/cities.routes";
import movieDetailsRoutes from "./routes/movie-details.routes";
import movieRoutes from "./routes/movie.routes";
import healthRoutes from "./routes/health.routes";
import notificationRoutes from "./routes/notification.routes";
import { errorHandler } from "./middlewares/errorHandler";
import seatRoutes from "./routes/seat.routes";
import reservationRoutes from "./routes/reservation.routes";

import cors from "cors";
import { corsOptions } from "./config/cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

// configuracion de CORS
app.use(cors(corsOptions));

// configuracion de Helmet
app.use(helmet());

// configuracion de Morgan para logging de peticiones HTTP
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(express.json());

// Rutas
app.use("/auth", authRoutes);
app.use("/membership", membershipRoutes);
app.use("/api/users", userRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/cities", citiesRoutes);
app.use("/api/movies", movieDetailsRoutes);
app.use("/api/v1/movies", movieRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/functions",seatRoutes);
app.use("/api/v1/reservations",reservationRoutes);

// Health check (HU-001 Escenario 1)
app.use("/api/v1/health", healthRoutes);

// Swagger
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//Swagger json format 

app.get("/api/docs.json",(_req, res) =>{
    res.status(200).json(swaggerSpec);
})

// Manejo global de errores (siempre al final)
app.use(errorHandler);

export default app;