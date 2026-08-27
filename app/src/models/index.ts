
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
import Role from "./role.model";
import Membership from "./membership.model";
import UserMembership from "./user-membership.model";
import EmailVerificationToken from "./email-verification-token.model";
import BonusWallet from "./bonus-wallet.model";
import NotificationPreference from "./notification-preference.model";
import UserGenre from "./user-genre.model";
import RefreshToken from "./refresh-token.model";
import AccessLog from "./access-log.model";
import PasswordResetToken from "./password-reset-token.model";
import MovieGenre from "./movie-genre.model";
import MovieStatus from "./movie-status.model";
import Format from "./format.model";
import Language from "./language.model";
import Cinema from "./cinema.model";
import Room from "./room.model";
import Movie from "./movie.model";
import Showtime from "./showtime.model";
import PremiereNotification from "./premiere-notification.model";
import Seat from "./seat.model";
import SeatLock from "./seat-lock.model";
import ReservationEntry from "./reservation-entry.model";
import GiftCard from "./gift-card.model";
import GiftCardTransaction from "./gift-card-transaction.model";
import SnackCategory from "./snack-category.model";
import Snack from "./snack.model";
import Inventory from "./inventory.model";
import SnackPromotion from "./snack-promotion.model";

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

// Catálogos del perfil de usuario (HU-001 / autenticación)
Role.hasMany(User, { foreignKey: "roleId" });
User.belongsTo(Role, { foreignKey: "roleId" });

Membership.hasMany(User, { foreignKey: "membershipId" });
User.belongsTo(Membership, { foreignKey: "membershipId" });

// Membresías individuales del usuario (HU-006): historial con ID propio
Membership.hasMany(UserMembership, { foreignKey: "membershipId" });
UserMembership.belongsTo(Membership, { foreignKey: "membershipId" });

User.hasMany(UserMembership, { foreignKey: "userId" });
UserMembership.belongsTo(User, { foreignKey: "userId" });

// Recursos creados automáticamente durante el registro (HU-006)
User.hasMany(EmailVerificationToken, { foreignKey: "userId" });
EmailVerificationToken.belongsTo(User, { foreignKey: "userId" });

User.hasOne(BonusWallet, { foreignKey: "userId" });
BonusWallet.belongsTo(User, { foreignKey: "userId" });

User.hasOne(NotificationPreference, { foreignKey: "userId" });
NotificationPreference.belongsTo(User, { foreignKey: "userId" });

UserGenre.hasMany(User, { foreignKey: "userGenreId" });
User.belongsTo(UserGenre, { foreignKey: "userGenreId" });

User.belongsTo(City, { foreignKey: "cityId" });
City.hasMany(User, { foreignKey: "cityId" });

// Complejo favorito del perfil (HU-006)
User.belongsTo(Cinema, { foreignKey: "favoriteCinemaId", as: "favoriteCinema" });
Cinema.hasMany(User, { foreignKey: "favoriteCinemaId", as: "favoriteUsers" });

// Refresh tokens (JWT)
User.hasMany(RefreshToken, { foreignKey: "userId" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });

// Auditoría de accesos (HU-007)
User.hasMany(AccessLog, { foreignKey: "userId" });
AccessLog.belongsTo(User, { foreignKey: "userId" });

// Tokens de recuperación de contraseña (HU-007)
User.hasMany(PasswordResetToken, { foreignKey: "userId" });
PasswordResetToken.belongsTo(User, { foreignKey: "userId" });

// Funciones (Showtime): el corazón de HU-003
Movie.hasMany(Showtime, { foreignKey: "movieId" });
Showtime.belongsTo(Movie, { foreignKey: "movieId" });

Room.hasMany(Showtime, { foreignKey: "roomId" });
Showtime.belongsTo(Room, { foreignKey: "roomId" });

Room.hasMany(Seat, { foreignKey: "roomId" });
Seat.belongsTo(Room, { foreignKey: "roomId",});

//relaciones sillas bloqueadas perteneces a ciertas funciones
Showtime.hasMany(SeatLock, { foreignKey: "showtimeId",});
SeatLock.belongsTo(Showtime, { foreignKey: "showtimeId",});

Seat.hasMany(SeatLock, { foreignKey: "seatId",});
SeatLock.belongsTo(Seat, { foreignKey: "seatId",});

//
Showtime.hasMany(ReservationEntry, { foreignKey: "showtimeId",});
ReservationEntry.belongsTo(Showtime, { foreignKey: "showtimeId",});

Seat.hasMany(ReservationEntry, { foreignKey: "seatId",});
ReservationEntry.belongsTo(Seat, { foreignKey: "seatId" });

Format.hasMany(Showtime, { foreignKey: "formatId" });
Showtime.belongsTo(Format, { foreignKey: "formatId" });

Language.hasMany(Showtime, { foreignKey: "languageId" });
Showtime.belongsTo(Language, { foreignKey: "languageId" });

// Notificaciones de estreno (HU-005)
User.hasMany(PremiereNotification, { foreignKey: "userId" });
PremiereNotification.belongsTo(User, { foreignKey: "userId" });

Movie.hasMany(PremiereNotification, { foreignKey: "movieId" });
PremiereNotification.belongsTo(Movie, { foreignKey: "movieId" });

// Gift cards compradas para regalar y su auditoría monetaria (HU-011)
User.hasMany(GiftCard, { foreignKey: "purchaserUserId", as: "purchasedGiftCards" });
GiftCard.belongsTo(User, { foreignKey: "purchaserUserId", as: "purchaser" });
GiftCard.hasMany(GiftCardTransaction, { foreignKey: "giftCardId", as: "transactions" });
GiftCardTransaction.belongsTo(GiftCard, { foreignKey: "giftCardId" });
User.hasMany(GiftCardTransaction, { foreignKey: "userId" });
GiftCardTransaction.belongsTo(User, { foreignKey: "userId" });

// HU12
SnackCategory.hasMany(Snack, { foreignKey: "snackCategoryId", as: "snacks" });
Snack.belongsTo(SnackCategory, { foreignKey: "snackCategoryId", as: "category" });

// Un snack tiene un único registro de inventario (hoy)
Snack.hasOne(Inventory, { foreignKey: "snackId", as: "inventory" });
Inventory.belongsTo(Snack, { foreignKey: "snackId", as: "snack" });

// Promociones: opcionalmente ligadas a snack o a categoría
Snack.hasMany(SnackPromotion, { foreignKey: "snackId", as: "promotions" });
SnackPromotion.belongsTo(Snack, { foreignKey: "snackId", as: "snack" });

SnackCategory.hasMany(SnackPromotion, { foreignKey: "snackCategoryId", as: "promotions" });
SnackPromotion.belongsTo(SnackCategory, { foreignKey: "snackCategoryId", as: "category" });



export {
  Country,
  Department,
  City,
  User,
  Role,
  Membership,
  UserMembership,
  EmailVerificationToken,
  BonusWallet,
  NotificationPreference,
  UserGenre,
  RefreshToken,
  AccessLog,
  PasswordResetToken,
  MovieGenre,
  MovieStatus,
  Format,
  Language,
  Cinema,
  Room,
  Movie,
  Showtime,
  PremiereNotification,
  Seat,
  SeatLock,
  ReservationEntry,
  GiftCard,
  GiftCardTransaction,
  SnackCategory, 
  Snack, 
  Inventory, 
  SnackPromotion
};

