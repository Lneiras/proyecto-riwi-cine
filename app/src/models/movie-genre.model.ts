// app/src/models/movie-genre.model.ts

/**
 * Modelo de Género de Película
 * ----------------------------
 * Catálogo usado para filtrar la cartelera (HU-003) y como criterio del
 * motor básico de recomendaciones similares (HU-004).
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface MovieGenreAttributes {
  id: number;
  name: string;
}

export interface MovieGenreCreationAttributes extends Optional<MovieGenreAttributes, "id"> {}

class MovieGenre extends Model<MovieGenreAttributes, MovieGenreCreationAttributes> implements MovieGenreAttributes {
  /** Identificador único del género (clave primaria). */
  public id!: number;

  /** Nombre del género. */
  public name!: string;
}

MovieGenre.init(
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
    modelName: "MovieGenre",
    tableName: "movieGenres",
    timestamps: true,
  }
);

export default MovieGenre;
