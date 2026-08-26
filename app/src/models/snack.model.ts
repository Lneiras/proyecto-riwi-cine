import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface SnackAttributes {
    id: number;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    snackCategoryId: number;
    isActive: boolean;
}

export interface SnackCreationAttributes
    extends Optional<
        SnackAttributes,
        "id" | "description" | "imageUrl" | "isActive"
    > {}

class Snack
    extends Model<SnackAttributes, SnackCreationAttributes>
    implements SnackAttributes
{
    /** Identificador único del producto (clave primaria). */
    public id!: number;
    /** Nombre comercial del producto (ej. "Combo Grande", "Nachos"). */
    public name!: string;
    /** Descripción opcional del producto. */
    public description!: string | null;
    /** Precio unitario del producto. */
    public price!: number;
    /** URL de la imagen del producto (catálogo público). */
    public imageUrl!: string | null;
    /** FK a la categoría a la que pertenece el producto. */
    public snackCategoryId!: number;
    /** Permite ocultar el producto del catálogo sin borrar su historial. */
    public isActive!: boolean;
}

Snack.init(
    {
        id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        },
        name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
        },
        description: {
        type: DataTypes.TEXT,
        allowNull: true,
        },
        price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
        },
        imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        },
        snackCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        },
        isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: "Snack",
        tableName: "snacks",
        timestamps: true,
    }
);

export default Snack;