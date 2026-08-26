// ruta_avanzada/proyecto_incremental/app/src/index.ts

/**
 * Es el entrypoint real de la aplicación.
 * Se encarga de:
 * - Levantar la base de datos (sequelize.authenticate + sequelize.sync).
 * - Arrancar el servidor (app.listen).
 * - Es el que realmente ejecutas cuando corres npm run dev o docker-compose up.
 */
import "dotenv/config";

import app from "./server";
import sequelize from "./config/database";
import { validateEnv, validateSeatConfig, validateCartConfig } from "./config/env";
import premiereNotificationJob from "./jobs/premiere-notification.job";

// Registra todos los modelos del dominio (ver comentario en el archivo)
// para que `sequelize.sync()` cree sus tablas al arrancar, sin importar
// si su ruta ya está montada en server.ts o no.
import "./models";

import { connectRedis } from "./config/redis";
import seatLockCleanupJob from "./jobs/seat-lock-cleanup.job";

const PORT = process.env.APP_PORT || 3000;
const start = async () => {
  try {
    // HU-001 Escenario 2: falla con mensaje claro si falta una variable obligatoria
    validateEnv();
    validateSeatConfig();
    validateCartConfig();

    await sequelize.authenticate();
    console.log("Conexión a la BD establecida...");

    await sequelize.sync({
      alter: true
    }); // crea tablas si no existen

    await connectRedis()

    await seatLockCleanupJob.start()

    // HU-005 Task 2: job que notifica a suscriptores cuando la película ya está en cartelera
    await premiereNotificationJob.start();

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar la aplicación:", error);
    process.exit(1);
  }
};

start();
