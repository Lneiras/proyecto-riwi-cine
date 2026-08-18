import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../config/database";

export interface SeatAttributes {
  id: number;
  roomId: number;
  row: string;
  number: number;
  type: string;
  status: string;
}

export interface SeatCreationAttributes
  extends Optional<SeatAttributes, "id"> {}

class Seat extends Model<SeatAttributes,SeatCreationAttributes> implements SeatAttributes{
  public id!: number;
  public roomId!: number;
  public row!: string;
  public number!: number;
  public type!: string;
  public status!: string;
}

Seat.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    row: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },

    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "General",
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "available",
    }
  },
  {
    sequelize,
    modelName: "Seat",
    tableName: "seats",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["roomId", "row", "number"],
      },
    ],
  }
);

export default Seat;