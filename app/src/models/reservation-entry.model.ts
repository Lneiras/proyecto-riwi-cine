import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../config/database";

export interface ReservationEntryAttributes {
  id: number;
  reservationId: number;
  showtimeId: number;
  seatId: number;
  unitPrice: number;
}

export interface ReservationEntryCreationAttributes
  extends Optional<
    ReservationEntryAttributes,
    "id"
  > {}

class ReservationEntry
  extends Model<
    ReservationEntryAttributes,
    ReservationEntryCreationAttributes
  >
  implements ReservationEntryAttributes
{
  public id!: number;
  public reservationId!: number;
  public showtimeId!: number;
  public seatId!: number;
  public unitPrice!: number;
}

ReservationEntry.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    reservationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    showtimeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    seatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ReservationEntry",
    tableName: "reservation_entries",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["showtimeId", "seatId"],
      },
    ],
  }
);

export default ReservationEntry;