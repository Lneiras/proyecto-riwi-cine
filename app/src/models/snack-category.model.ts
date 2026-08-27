import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface SnackCategoryAttributes {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
}

export interface SnackCategoryCreationAttributes
    extends Optional<SnackCategoryAttributes, "id" | "description" | "isActive"> {}

class SnackCategory
    extends Model<SnackCategoryAttributes, SnackCategoryCreationAttributes>
    implements SnackCategoryAttributes
{
    /** Identificador único de la categoría (clave primaria). */
    public id!: number;
    /** Nombre de la categoría (ej. "Combos", "Bebidas", "Dulces"). */
    public name!: string;
    /** Descripción opcional de la categoría. */
    public description!: string | null;
    /** Permite ocultar la categoría sin borrar su historial (soft delete lógico). */
    public isActive!: boolean;
}

SnackCategory.init(
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
        validate: { notEmpty: true },
        },
        description: {
        type: DataTypes.TEXT,
        allowNull: true,
        },
        isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: "SnackCategory",
        tableName: "snackCategories",
        timestamps: true,
    }
);

export default SnackCategory;