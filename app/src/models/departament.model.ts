import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";


export interface DepartmentAttributes {
  id: number;
  name: string;
  countryId: number;
}


export interface DepartmentCreationAttributes extends Optional<DepartmentAttributes, "id"> {}


class Department extends Model<DepartmentAttributes, DepartmentCreationAttributes> implements DepartmentAttributes {
  /** Identificador único del departamento (clave primaria). */
  public id!: number;

  /** Nombre del departamento. */
  public name!: string;

  /** ID del país al que pertenece el departamento. */
  public countryId!: number;    
}


Department.init(
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
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "countries", // Nombre de la tabla referenciada
        key: "id",          // Columna referenciada
      },  

    },
    
  },
  {
    sequelize,
    modelName: "Department",      // Nombre del modelo en Sequelize
    tableName: "departments",     // Nombre de la tabla en la base de datos
    timestamps: true,      // Incluye createdAt y updatedAt
  }
);

export default Department;
