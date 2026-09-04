import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../config/database";

export type GiftCardTransactionType =
  | "created"
  | "activated"
  | "redeemed"
  | "refunded"
  | "cancelled";

export interface GiftCardTransactionAttributes {
  id: number;

  giftCardId: number;

  userId:
    | number
    | null;

  type:
    GiftCardTransactionType;

  amount: number;

  balanceAfter: number;

  reference:
    | string
    | null;
}

export interface GiftCardTransactionCreationAttributes
  extends Optional<
    GiftCardTransactionAttributes,
    | "id"
    | "userId"
    | "reference"
  > {}

class GiftCardTransaction
  extends Model<
    GiftCardTransactionAttributes,
    GiftCardTransactionCreationAttributes
  >
  implements GiftCardTransactionAttributes
{
  public id!: number;

  public giftCardId!: number;

  public userId!:
    | number
    | null;

  public type!:
    GiftCardTransactionType;

  public amount!: number;

  public balanceAfter!: number;

  public reference!:
    | string
    | null;
}

GiftCardTransaction.init(
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
      allowNull: true,
    },

    type: {
      type:
        DataTypes.STRING(30),
      allowNull: false,
    },

    amount: {
      type:
        DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    balanceAfter: {
      type:
        DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    reference: {
      type:
        DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,

    modelName:
      "GiftCardTransaction",

    tableName:
      "gift_card_transactions",

    timestamps: true,
  }
);

export default GiftCardTransaction;