// app/src/models/user-genre.model.ts

/**
 * Modelo de Género de Usuario
 * ---------------------------
 * Catálogo de géneros para el perfil del usuario. Tabla `userGenres`.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface UserGenreAttributes {
  id: number;
  name: string;
}

export interface UserGenreCreationAttributes extends Optional<UserGenreAttributes, "id"> {}

class UserGenre
  extends Model<UserGenreAttributes, UserGenreCreationAttributes>
  implements UserGenreAttributes
{
  /** Identificador único del género (clave primaria). */
  public id!: number;

  /** Nombre del género (ej. "Masculino", "Femenino"). */
  public name!: string;
}

UserGenre.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "UserGenre",
    tableName: "userGenres",
    timestamps: true,
  }
);

export default UserGenre;
