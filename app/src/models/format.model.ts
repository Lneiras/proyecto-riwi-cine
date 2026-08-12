// app/src/models/format.model.ts

/**
 * Modelo de Formato
 * -----------------
 * Catálogo (ej. 2D, 3D, 4DX) usado como filtro combinable en HU-003.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface FormatAttributes {
  id: number;
  name: string;
}

export interface FormatCreationAttributes extends Optional<FormatAttributes, "id"> {}

class Format extends Model<FormatAttributes, FormatCreationAttributes> implements FormatAttributes {
  /** Identificador único del formato (clave primaria). */
  public id!: number;

  /** Nombre del formato (ej. "2D", "3D", "4DX"). */
  public name!: string;
}

Format.init(
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
    modelName: "Format",
    tableName: "formats",
    timestamps: true,
  }
);

export default Format;
