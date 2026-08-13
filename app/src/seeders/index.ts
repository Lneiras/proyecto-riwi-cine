// app/src/seeders/index.ts

/**
 * Orquestador de Seeders
 * ----------------------
 * Ejecuta todos los seeders en el orden correcto según las dependencias
 * de llave foránea (geografía -> catálogos -> cines/salas -> películas -> funciones).
 *
 * Uso:
 *   npm run seed
 *
 * Es seguro re-ejecutarlo: cada seeder usa `findOrCreate`, así que no
 * duplica datos si ya existen.
 *
 * Nota sobre el esquema: este proyecto no usa migraciones para crear las
 * tablas (ver `src/index.ts`, que llama a `sequelize.sync({ alter: true })`
 * al arrancar). Por eso este script también sincroniza el esquema antes
 * de sembrar datos, para que funcione de forma autónoma (ej. en CI o en
 * una base de datos recién creada) sin depender de que la API ya se
 * haya levantado antes.
 */

import sequelize from "../config/database";

// Registra todos los modelos del dominio antes de sync() (ver
// `src/models/index.ts`). Es la misma importación que usa el
// entrypoint real de la app (`src/index.ts`).
import "../models";

import { seedCountries } from "./country.seed";
import { seedDepartments } from "./department.seed";
import { seedCities } from "./city.seed";
import { seedMovieGenres } from "./movie-genre.seed";
import { seedMovieStatuses } from "./movie-status.seed";
import { seedFormats } from "./format.seed";
import { seedLanguages } from "./language.seed";
import { seedCinemas } from "./cinema.seed";
import { seedRooms } from "./room.seed";
import { seedMovies } from "./movie.seed";
import { seedShowtimes } from "./showtime.seed";
import { seedRoles } from "./role.seed";
import { seedMemberships } from "./membership.seed";
import { seedUserGenres } from "./user-genre.seed";
import { seedUsers } from "./user.seed";
import { seedPremiereNotifications } from "./premiere-notification.seed";

async function runSeeders(): Promise<void> {
  await sequelize.authenticate();
  console.log("Conexión a la base de datos establecida.");

  await sequelize.sync({ alter: true });
  console.log("Esquema sincronizado. Iniciando seeders...\n");

  // Geografía
  const countryIds = await seedCountries();
  const departmentIds = await seedDepartments(countryIds);
  const cityIds = await seedCities(departmentIds);

  // Catálogos independientes
  const genreIds = await seedMovieGenres();
  const statusIds = await seedMovieStatuses();
  const formatIds = await seedFormats();
  const languageIds = await seedLanguages();

  // Infraestructura física
  const cinemaIds = await seedCinemas(cityIds);
  const roomIds = await seedRooms(cinemaIds);

  // Catálogo de películas y funciones
  const movieIds = await seedMovies(genreIds, statusIds);
  await seedShowtimes(movieIds, roomIds, formatIds, languageIds);

  // Catálogos del perfil de usuario
  const roleIds = await seedRoles();
  const membershipIds = await seedMemberships();
  await seedUserGenres();

  // Usuarios y suscripciones a estrenos
  const userIds = await seedUsers(roleIds, membershipIds);
  await seedPremiereNotifications(userIds, movieIds);

  console.log("\n✅ Seed completado con éxito.");
}

runSeeders()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error ejecutando los seeders:", error);
    process.exit(1);
  });