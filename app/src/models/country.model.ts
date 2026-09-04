import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";


export interface CountryAttributes {
  id: number;
  name: string;
}


export interface CountryCreationAttributes extends Optional<CountryAttributes, "id"> {}


class Country extends Model<CountryAttributes, CountryCreationAttributes> implements CountryAttributes {
  /** Identificador único del país (clave primaria). */
  public id!: number;

  /** Nombre del país. */
  public name!: string;
}       


Country.init(
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
  },

  {
    sequelize,
    modelName: "Country",      // Nombre del modelo en Sequelize
    tableName: "countries",     // Nombre de la tabla en la base de datos
    timestamps: true,      // Incluye createdAt y updatedAt
  }
);

export default Country;
