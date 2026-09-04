import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface TicketAttributes {
    id: number,
    userId: number,
    reservationEntryId: number,
    invoiceId: number,
    ticketCode: string,
    qrCode: string,
    status: string,
    usedAt: Date | null,
}

export interface TicketCreationAttributes extends Optional<TicketAttributes, "id" | "status" | "usedAt"> {}

class Ticket extends Model<TicketAttributes, TicketCreationAttributes> implements TicketAttributes {
    public id!: number;
    public userId!: number;
    public reservationEntryId!: number;
    public invoiceId!: number;
    public ticketCode!: string;
    public qrCode!: string;
    public status!: string;
    public usedAt!: Date | null;
}

Ticket.init(
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
       reservationEntryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // RN-057: una reservationEntry solo puede generar un Ticket
        references: {
            model: "reservation_entries",
            key: "id",
        },
       },
       invoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "invoices",
            key: "id",
        },
       },
       ticketCode: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: DataTypes.UUIDV4,
       },
       qrCode: {
        type: DataTypes.TEXT,
        allowNull: false,
       },
       status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "ACTIVE", // ACTIVE | USED
       },
       usedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
       },
    },
    {
        sequelize,
        modelName: "Ticket",
        tableName: "tickets",
        timestamps: true,
    }
);

export default Ticket;