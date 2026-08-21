// app/src/models/bonus-wallet.model.ts

/**
 * Billetera de bonos (HU-006)
 * ---------------------------
 * Se crea vacía junto con el usuario y queda disponible para futuras HU.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface BonusWalletAttributes {
  id: number;
  userId: number;
  balance: number;
}

export interface BonusWalletCreationAttributes
  extends Optional<BonusWalletAttributes, "id" | "balance"> {}

class BonusWallet
  extends Model<BonusWalletAttributes, BonusWalletCreationAttributes>
  implements BonusWalletAttributes
{
  public id!: number;
  public userId!: number;
  public balance!: number;
}

BonusWallet.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "BonusWallet",
    tableName: "bonusWallets",
    timestamps: true,
  }
);

export default BonusWallet;
