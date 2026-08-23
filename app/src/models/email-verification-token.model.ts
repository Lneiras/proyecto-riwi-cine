// app/src/models/email-verification-token.model.ts

/**
 * Token de verificación de correo (HU-006)
 * ----------------------------------------
 * Se almacena únicamente el hash SHA-256 del token enviado por correo.
 * El token es de un solo uso y expira a las 24 horas.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface EmailVerificationTokenAttributes {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface EmailVerificationTokenCreationAttributes
  extends Optional<EmailVerificationTokenAttributes, "id" | "usedAt"> {}

class EmailVerificationToken
  extends Model<EmailVerificationTokenAttributes, EmailVerificationTokenCreationAttributes>
  implements EmailVerificationTokenAttributes
{
  public id!: number;
  public userId!: number;
  public tokenHash!: string;
  public expiresAt!: Date;
  public usedAt!: Date | null;
}

EmailVerificationToken.init(
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
    tokenHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: "EmailVerificationToken",
    tableName: "emailVerificationTokens",
    timestamps: true,
    indexes: [{ fields: ["userId"] }, { fields: ["expiresAt"] }],
  }
);

export default EmailVerificationToken;
