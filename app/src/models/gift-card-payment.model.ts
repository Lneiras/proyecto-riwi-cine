import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../config/database";

export type GiftCardPaymentStatus =
  | "Aprobado"
  | "Rechazado";

export interface GiftCardPaymentAttributes {
  id: number;

  giftCardId: number;

  userId: number;

  paymentMethod: string;

  transactionReference: string;

  amount: number;

  tax: number;

  status: GiftCardPaymentStatus;

  paymentDate: Date;
}

export interface GiftCardPaymentCreationAttributes
  extends Optional<
    GiftCardPaymentAttributes,
    "id" | "paymentDate"
  > {}

class GiftCardPayment
  extends Model<
    GiftCardPaymentAttributes,
    GiftCardPaymentCreationAttributes
  >
  implements GiftCardPaymentAttributes
{
  public id!: number;

  public giftCardId!: number;

  public userId!: number;

  public paymentMethod!: string;

  public transactionReference!: string;

  public amount!: number;

  public tax!: number;

  public status!:
    GiftCardPaymentStatus;

  public paymentDate!: Date;
}

GiftCardPayment.init(
  {
    id: {
      type:
        DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    giftCardId: {
      type:
        DataTypes.INTEGER,
      allowNull: false,
    },

    userId: {
      type:
        DataTypes.INTEGER,
      allowNull: false,
    },

    paymentMethod: {
      type:
        DataTypes.STRING(50),
      allowNull: false,
    },

    transactionReference: {
      type:
        DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    amount: {
      type:
        DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    tax: {
      type:
        DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    status: {
      type:
        DataTypes.STRING(20),
      allowNull: false,
    },

    paymentDate: {
      type:
        DataTypes.DATE,
      allowNull: false,

      defaultValue:
        DataTypes.NOW,
    },
  },
  {
    sequelize,

    modelName:
      "GiftCardPayment",

    tableName:
      "gift_card_payments",

    timestamps: true,
  }
);

export default GiftCardPayment;