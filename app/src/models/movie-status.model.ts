// app/src/models/movie-status.model.ts

/**
 * Modelo de Estado de Película
 * ----------------------------
 * Valores esperados: borrador, publicada, proximo_estreno, despublicada
 * (se mantienen en español porque son valores de negocio consumidos
 * directamente por las reglas/HU en español, no nombres estructurales).
 *
 * Clave para HU-003 (solo "publicada" aparece en cartelera) y HU-005
 * (solo "proximo_estreno" aparece en Próximos Estrenos).
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface MovieStatusAttributes {
  id: number;
  name: string;
}

export interface MovieStatusCreationAttributes extends Optional<MovieStatusAttributes, "id"> {}

class MovieStatus extends Model<MovieStatusAttributes, MovieStatusCreationAttributes> implements MovieStatusAttributes {
  /** Identificador único del estado (clave primaria). */
  public id!: number;

  /** Nombre del estado: borrador, publicada, proximo_estreno, despublicada. */
  public name!: string;
}

MovieStatus.init(
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
    modelName: "MovieStatus",
    tableName: "movieStatuses",
    timestamps: true,
  }
);

export default MovieStatus;
