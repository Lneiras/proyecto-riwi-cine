import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../config/database";

export interface ReservationAttributes {
  id: number;

  userId: number;

  subtotal: number;

  discount: number;

  tax: number;

  total: number;

  status:
    | "Pendiente"
    | "Pagada"
    | "Cancelada";
}

export interface ReservationCreationAttributes
  extends Optional<
    ReservationAttributes,
    | "id"
    | "subtotal"
    | "discount"
    | "tax"
    | "total"
    | "status"
  > {}

class Reservation
  extends Model<
    ReservationAttributes,
    ReservationCreationAttributes
  >
  implements ReservationAttributes
{
  public id!: number;

  public userId!: number;

  public subtotal!: number;

  public discount!: number;

  public tax!: number;

  public total!: number;

  public status!:
    | "Pendiente"
    | "Pagada"
    | "Cancelada";
}

Reservation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    subtotal: {
      type: DataTypes.DECIMAL(
        10,
        2
      ),
      allowNull: false,
      defaultValue: 0,
    },

    discount: {
      type: DataTypes.DECIMAL(
        10,
        2
      ),
      allowNull: false,
      defaultValue: 0,
    },

    tax: {
      type: DataTypes.DECIMAL(
        10,
        2
      ),
      allowNull: false,
      defaultValue: 0,
    },

    total: {
      type: DataTypes.DECIMAL(
        10,
        2
      ),
      allowNull: false,
      defaultValue: 0,

      validate: {
        min: 0,
      },
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,

      defaultValue:
        "Pendiente",
    },
  },

  {
    sequelize,

    modelName:
      "Reservation",

    tableName:
      "reservations",

    timestamps: true,
  }
);

export default Reservation;