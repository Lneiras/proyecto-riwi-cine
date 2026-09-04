import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface InvoiceAttributes {
    id: number,
    userId: number,
    invoiceNumber: string,
    subtotal: number,
    total: number,
    status: string,
}

export interface InvoiceCreationAttributes extends Optional<InvoiceAttributes, "id" | "status">{}

class Invoice extends Model<InvoiceAttributes, InvoiceCreationAttributes> implements InvoiceAttributes{
    public id!: number;
    public userId!: number;
    public invoiceNumber!: string;
    public subtotal!: number;
    public total!: number;
    public status!: string;
}

Invoice.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        invoiceNumber: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        subtotal: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false,
        },
        total: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "GENERATED",
        },

    },
    {
        sequelize,
        modelName: "Invoice",
        tableName: "invoices",
        timestamps: true,
    }
);

export default Invoice;
