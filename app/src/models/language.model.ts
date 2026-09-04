// app/src/models/language.model.ts

/**
 * Modelo de Idioma
 * ----------------
 * Catálogo (ej. Subtitulada, Doblada) usado como filtro combinable en HU-003.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface LanguageAttributes {
  id: number;
  name: string;
}

export interface LanguageCreationAttributes extends Optional<LanguageAttributes, "id"> {}

class Language extends Model<LanguageAttributes, LanguageCreationAttributes> implements LanguageAttributes {
  /** Identificador único del idioma (clave primaria). */
  public id!: number;

  /** Nombre del idioma. */
  public name!: string;
}

Language.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Language",
    tableName: "languages",
    timestamps: true,
  }
);

export default Language;
