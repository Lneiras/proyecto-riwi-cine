// app/src/models/room.model.ts

/**
 * Modelo de Sala
 * --------------
 * Cada sala pertenece a un cine y contiene las funciones programadas
 * (HU-003, HU-004).
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface RoomAttributes {
  id: number;
  cinemaId: number;
  numberName: string;
  capacity: number;
}

export interface RoomCreationAttributes extends Optional<RoomAttributes, "id"> {}

class Room extends Model<RoomAttributes, RoomCreationAttributes> implements RoomAttributes {
  /** Identificador único de la sala (clave primaria). */
  public id!: number;

  /** FK hacia `cinemas.id`. */
  public cinemaId!: number;

  /** Nombre o número de la sala (ej. "Sala 3"). */
  public numberName!: string;

  /** Capacidad total. */
  public capacity!: number;
}

Room.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cinemaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "cinemas",
        key: "id",
      },
    },
    numberName: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
  },
  {
    sequelize,
    modelName: "Room",
    tableName: "rooms",
    timestamps: true,
  }
);

export default Room;
