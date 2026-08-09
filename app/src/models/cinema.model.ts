// app/src/models/cinema.model.ts

/**
 * Modelo de Cine (Complejo)
 * -------------------------
 * Cada complejo pertenece a una ciudad y contiene salas
 * (HU-003: filtrado de cartelera por complejo).
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface CinemaAttributes {
  id: number;
  name: string;
  address: string;
  cityId: number;
}

export interface CinemaCreationAttributes extends Optional<CinemaAttributes, "id"> {}

class Cinema extends Model<CinemaAttributes, CinemaCreationAttributes> implements CinemaAttributes {
  /** Identificador único del cine (clave primaria). */
  public id!: number;

  /** Nombre del complejo de cine. */
  public name!: string;

  /** Dirección física del complejo. */
  public address!: string;

  /** FK hacia `cities.id`. */
  public cityId!: number;
}

Cinema.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "cities",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Cinema",
    tableName: "cinemas",
    timestamps: true,
  }
);

export default Cinema;
