import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface TicketAttributes {
    id: number,
    userId: number,
    reservationEntryId: number,
    ticketCode: string,
    qrCode: string,
}

export interface TicketCreationAttributes extends Optional<TicketAttributes, "id"> {}

class Ticket extends Model<TicketAttributes, TicketCreationAttributes> implements TicketAttributes {
    public id!: number;
    public userId!: number;
    public reservationEntryId!: number;
    public ticketCode!: string;
    public qrCode!: string;
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
        references: {
            model: "reservation_entries",
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
    },
    {
        sequelize,
        modelName: "Ticket",
        tableName: "tickets",
        timestamps: true,
    }
);

export default Ticket