import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../config/database";

export interface SeatLockAttributes {
  id: number;
  showtimeId: number;
  seatId: number;
  userId: number;
  lockToken: string;
  lockedAt: Date;
  expiresAt: Date;
  status: string;
}

export interface SeatLockCreationAttributes
  extends Optional<
    SeatLockAttributes,
    "id" | "lockedAt" | "status"
  > {}

class SeatLock
  extends Model<
    SeatLockAttributes,
    SeatLockCreationAttributes
  >
  implements SeatLockAttributes
{
  public id!: number;
  public showtimeId!: number;
  public seatId!: number;
  public userId!: number;
  public lockToken!: string;
  public lockedAt!: Date;
  public expiresAt!: Date;
  public status!: string;
}

SeatLock.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    showtimeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    seatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    lockToken: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    lockedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    sequelize,
    modelName: "SeatLock",
    tableName: "seat_locks",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["showtimeId", "seatId"],
      },
    ],
  }
);

export default SeatLock;