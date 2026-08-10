// app/src/models/index.ts

/**
 * Índice central de modelos
 * -------------------------
 * `sequelize.sync()` (llamado en `src/index.ts` al arrancar la app) solo
 * crea tablas para los modelos que ya fueron registrados con
 * `Model.init()` en el momento en que se llama a `sync()`. Y `Model.init()`
 * solo corre cuando el archivo del modelo es importado por algo.
 *
 * Antes de este archivo, un modelo solo se registraba si su controlador
 * estaba montado en `server.ts` (ej. `country.model.ts` vía
 * `/api/countries`). Modelos como `departments`, `cities`, `movies`,
 * `cinemas`, etc. NO se creaban al arrancar la app porque nada los
 * importaba todavía (solo se creaban si corrías el script de seed, que
 * sí los importa a mano).
 *
 * Importando este archivo una sola vez en `src/index.ts`, ANTES de
 * `sequelize.sync()`, garantizamos que las 13 tablas del dominio se
 * creen automáticamente al levantar la app (`npm run dev`,
 * `docker-compose up`), sin depender de qué rutas estén montadas.
 *
 * Cuando agreguen un modelo nuevo, se importa aquí también.
 */

import Country from "./country.model";
import Department from "./departament.model";
import City from "./cities.model";
import User from "./user.model";
import MovieGenre from "./movie-genre.model";
import MovieStatus from "./movie-status.model";
import Format from "./format.model";
import Language from "./language.model";
import Cinema from "./cinema.model";
import Room from "./room.model";
import Movie from "./movie.model";
import Showtime from "./showtime.model";
import PremiereNotification from "./premiere-notification.model";


/**
 * Asociaciones entre modelos
 * ---------------------------
 * Se definen aquí, en un solo lugar centralizado, DESPUÉS de que todos
 * los modelos ya fueron inicializados con Model.init() (que ocurre al
 * importarlos arriba). Habilitan `include` en las queries (joins) para
 * HU-003 (cartelera con género/formato/idioma), HU-004 (detalle con
 * funciones) y HU-009 (selección de función con datos de sala/cine).
 */

// Geografía: país → departamento → ciudad → cine → sala
Country.hasMany(Department, { foreignKey: "countryId" });
Department.belongsTo(Country, { foreignKey: "countryId" });

Department.hasMany(City, { foreignKey: "departmentId" });
City.belongsTo(Department, { foreignKey: "departmentId" });

City.hasMany(Cinema, { foreignKey: "cityId" });
Cinema.belongsTo(City, { foreignKey: "cityId" });

Cinema.hasMany(Room, { foreignKey: "cinemaId" });
Room.belongsTo(Cinema, { foreignKey: "cinemaId" });

// Catálogo de películas
Movie.belongsTo(MovieGenre, { foreignKey: "genreId" });
MovieGenre.hasMany(Movie, { foreignKey: "genreId" });

Movie.belongsTo(MovieStatus, { foreignKey: "statusId" });
MovieStatus.hasMany(Movie, { foreignKey: "statusId" });

// Funciones (Showtime): el corazón de HU-003
Movie.hasMany(Showtime, { foreignKey: "movieId" });
Showtime.belongsTo(Movie, { foreignKey: "movieId" });

Room.hasMany(Showtime, { foreignKey: "roomId" });
Showtime.belongsTo(Room, { foreignKey: "roomId" });

Format.hasMany(Showtime, { foreignKey: "formatId" });
Showtime.belongsTo(Format, { foreignKey: "formatId" });

Language.hasMany(Showtime, { foreignKey: "languageId" });
Showtime.belongsTo(Language, { foreignKey: "languageId" });

// Notificaciones de estreno (HU-005)
User.hasMany(PremiereNotification, { foreignKey: "userId" });
PremiereNotification.belongsTo(User, { foreignKey: "userId" });

Movie.hasMany(PremiereNotification, { foreignKey: "movieId" });
PremiereNotification.belongsTo(Movie, { foreignKey: "movieId" });

export {
  Country,
  Department,
  City,
  User,
  MovieGenre,
  MovieStatus,
  Format,
  Language,
  Cinema,
  Room,
  Movie,
  Showtime,
  PremiereNotification,
};