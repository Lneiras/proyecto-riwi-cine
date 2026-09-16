import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface TicketAttributes {
  id: number;
  reservationEntryId: number;
  qrCode: string;
  status:
    | "valida"
    | "utilizada"
    | "transferida"
    | "anulada";
  currentHolderId: number;
}

export interface TicketCreationAttributes
  extends Optional<
    TicketAttributes,
    "id" | "status"
  > {}

class Ticket
  extends Model<
    TicketAttributes,
    TicketCreationAttributes
  >
  implements TicketAttributes
{
  public id!: number;
  public reservationEntryId!: number;
  public qrCode!: string;
  public status!:
    | "valida"
    | "utilizada"
    | "transferida"
    | "anulada";
  public currentHolderId!: number;
}

Ticket.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    reservationEntryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    qrCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "valida",
    },

    currentHolderId: {
      type: DataTypes.INTEGER,
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

export default Ticket;