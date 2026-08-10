// app/src/models/showtime.model.ts

/**
 * Modelo de Función
 * -----------------
 * Una película programada en una sala, con formato, idioma, fecha/hora
 * y precio base. Eje de HU-003 (Cartelera Semanal) y HU-004 (Detalle
 * de Película: funciones disponibles, horarios agotados).
 *
 * Nota: la clase se llama `Showtime` (y no `Function`) para no colisionar
 * con el tipo global `Function` de TypeScript/JavaScript.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface ShowtimeAttributes {
  id: number;
  movieId: number;
  roomId: number;
  formatId: number;
  languageId: number;
  dateTime: Date;
  basePrice: number;
}

export interface ShowtimeCreationAttributes extends Optional<ShowtimeAttributes, "id"> {}

class Showtime extends Model<ShowtimeAttributes, ShowtimeCreationAttributes> implements ShowtimeAttributes {
  /** Identificador único de la función (clave primaria). */
  public id!: number;

  /** FK hacia `movies.id`. */
  public movieId!: number;

  /** FK hacia `rooms.id`. */
  public roomId!: number;

  /** FK hacia `formats.id`. */
  public formatId!: number;

  /** FK hacia `languages.id`. */
  public languageId!: number;

  /** Fecha y hora de la función. */
  public dateTime!: Date;

  /** Precio base. */
  public basePrice!: number;
}

Showtime.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "movies",
        key: "id",
      },
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "rooms",
        key: "id",
      },
    },
    formatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "formats",
        key: "id",
      },
    },
    languageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "languages",
        key: "id",
      },
    },
    dateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
  },
  {
    sequelize,
    modelName: "Showtime",
    tableName: "showtimes",
    timestamps: true,
  }
);

export default Showtime;
