

/**
 * Modelo de Película
 * ------------------
 * Entidad central de HU-003 (Cartelera Semanal), HU-004 (Detalle de
 * Película) y HU-005 (Próximos Estrenos).
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface MovieAttributes {
  id: number;
  title: string;
  durationMinutes: number;
  rating: string;
  genreId: number;
  synopsis: string | null;
  releaseDate: Date | null;
  posterUrl: string | null;
  bannerUrl: string | null;
  trailerUrl: string | null;
  statusId: number;
}

export interface MovieCreationAttributes extends Optional<MovieAttributes, "id"> {}

class Movie extends Model<MovieAttributes, MovieCreationAttributes> implements MovieAttributes {
  /** Identificador único de la película (clave primaria). */
  public id!: number;

  /** Título de la película. */
  public title!: string;

  /** Duración en minutos. */
  public durationMinutes!: number;

  /** Clasificación (ej. "PG-13", "R"). */
  public rating!: string;

  /** FK hacia `movieGenres.id`. */
  public genreId!: number;

  /** Sinopsis de la película. */
  public synopsis!: string | null;

  /** Fecha de estreno. */
  public releaseDate!: Date | null;

  /** URL del póster. */
  public posterUrl!: string | null;

  /** URL del banner. */
  public bannerUrl!: string | null;

  /** URL del tráiler (embebido en HU-004). */
  public trailerUrl!: string | null;

  /** FK hacia `movieStatuses.id`. */
  public statusId!: number;
}

Movie.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    rating: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    genreId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "movieGenres",
        key: "id",
      },
    },
    synopsis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    releaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    posterUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bannerUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    trailerUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "movieStatuses",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Movie",
    tableName: "movies",
    timestamps: true,
    indexes: [
      { fields: ["genreId"] },   // filtro por género (Escenario 2)
      { fields: ["statusId"] },  // WHERE MovieStatus.name = 'publicada', se filtra siempre
      { fields: ["rating"] },    // filtro por clasificación
    ],
  }
);

// se agregan los indices para optimizar las consultas que se realizan para la cartelera semanal 
// y tambien para la busqueda de proximos estrenos y detalle de pelicula

export default Movie;
