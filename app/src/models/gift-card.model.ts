import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../config/database";

export type GiftCardStatus =
  | "pending_payment"
  | "active"
  | "redeemed"
  | "expired"
  | "cancelled";

export interface GiftCardAttributes {
  id: number;

  purchaserUserId: number;

  recipientEmail: string;

  recipientName:
    | string
    | null;

  senderName:
    | string
    | null;

  message:
    | string
    | null;

  codeHash:
    | string
    | null;

  codeLastFour:
    | string
    | null;

  initialBalance: number;

  availableBalance: number;

  status: GiftCardStatus;

  expiresAt:
    | Date
    | null;

  activatedAt:
    | Date
    | null;

  sentAt:
    | Date
    | null;
}

export interface GiftCardCreationAttributes
  extends Optional<
    GiftCardAttributes,
    | "id"
    | "recipientName"
    | "senderName"
    | "message"
    | "codeHash"
    | "codeLastFour"
    | "availableBalance"
    | "status"
    | "expiresAt"
    | "activatedAt"
    | "sentAt"
  > {}

class GiftCard
  extends Model<
    GiftCardAttributes,
    GiftCardCreationAttributes
  >
  implements GiftCardAttributes
{
  public id!: number;

  public purchaserUserId!: number;

  public recipientEmail!: string;

  public recipientName!:
    | string
    | null;

  public senderName!:
    | string
    | null;

  public message!:
    | string
    | null;

  public codeHash!:
    | string
    | null;

  public codeLastFour!:
    | string
    | null;

  public initialBalance!: number;

  public availableBalance!: number;

  public status!: GiftCardStatus;

  public expiresAt!:
    | Date
    | null;

  public activatedAt!:
    | Date
    | null;

  public sentAt!:
    | Date
    | null;

  /*
   * Nunca devolvemos el hash
   * del código mediante JSON.
   */
  toJSON(): Record<
    string,
    unknown
  > {
    const values =
      {
        ...this.get(),
      } as Record<
        string,
        unknown
      >;

    delete values.codeHash;

    return values;
  }
}

GiftCard.init(
  {
    id: {
      type:
        DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    purchaserUserId: {
      type:
        DataTypes.INTEGER,
      allowNull: false,
    },

    recipientEmail: {
      type:
        DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },

    recipientName: {
      type:
        DataTypes.STRING(100),
      allowNull: true,
    },

    senderName: {
      type:
        DataTypes.STRING(100),
      allowNull: true,
    },

    message: {
      type:
        DataTypes.STRING(500),
      allowNull: true,
    },

    codeHash: {
      type:
        DataTypes.STRING(64),
      allowNull: true,
      unique: true,
    },

    codeLastFour: {
      type:
        DataTypes.STRING(4),
      allowNull: true,
    },

    initialBalance: {
      type:
        DataTypes.DECIMAL(12, 2),
      allowNull: false,

      validate: {
        min: 0,
      },
    },

    availableBalance: {
      type:
        DataTypes.DECIMAL(12, 2),
      allowNull: false,

      defaultValue: 0,

      validate: {
        min: 0,
      },
    },

    status: {
      type:
        DataTypes.STRING(30),
      allowNull: false,

      defaultValue:
        "pending_payment",
    },

    expiresAt: {
      type:
        DataTypes.DATE,
      allowNull: true,
    },

    activatedAt: {
      type:
        DataTypes.DATE,
      allowNull: true,
    },

    sentAt: {
      type:
        DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,

    modelName:
      "GiftCard",

    tableName:
      "gift_cards",

    timestamps: true,

    indexes: [
      {
        fields: [
          "purchaserUserId",
        ],
      },

      {
        fields: [
          "recipientEmail",
        ],
      },

      {
        fields: [
          "status",
        ],
      },
    ],
  }
);

export default GiftCard;