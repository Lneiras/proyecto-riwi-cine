import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface InventoryAttributes {
    id: number;
    snackId: number;
    quantityAvailable: number;
    minStockAlert: number;
}

export interface InventoryCreationAttributes
    extends Optional<InventoryAttributes, "id" | "quantityAvailable" | "minStockAlert"> {}

class Inventory
    extends Model<InventoryAttributes, InventoryCreationAttributes>
    implements InventoryAttributes
{
    /** Identificador único del registro de inventario (clave primaria). */
    public id!: number;
    /** FK al producto de confitería (relación 1:1 hoy). */
    public snackId!: number;
    /** Cantidad disponible actualmente en stock. */
    public quantityAvailable!: number;
    /** Umbral para alertas de bajo inventario. */
    public minStockAlert!: number;
}

Inventory.init(
    {
        id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        },
        snackId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // 1 registro de inventario por snack (global, por ahora)
        },
        quantityAvailable: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
        },
        minStockAlert: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        validate: { min: 0 },
        },
    },
    {
        sequelize,
        modelName: "Inventory",
        tableName: "inventory",
        timestamps: true,
    }
);

export default Inventory;