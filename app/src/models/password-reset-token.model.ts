// app/src/models/password-reset-token.model.ts

/**
 * Token de recuperación de contraseña (HU-007)
 * --------------------------------------------
 * Se almacena únicamente el hash SHA-256 del token enviado por correo.
 * El token es de un solo uso y expira a los 30 minutos.
 * Tabla `passwordResetTokens`.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface PasswordResetTokenAttributes {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface PasswordResetTokenCreationAttributes
  extends Optional<PasswordResetTokenAttributes, "id" | "usedAt"> {}

class PasswordResetToken
  extends Model<PasswordResetTokenAttributes, PasswordResetTokenCreationAttributes>
  implements PasswordResetTokenAttributes
{
  public id!: number;
  public userId!: number;
  public tokenHash!: string;
  public expiresAt!: Date;
  public usedAt!: Date | null;
}

PasswordResetToken.init(
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
    modelName: "PasswordResetToken",
    tableName: "passwordResetTokens",
    timestamps: true,
    indexes: [{ fields: ["userId"] }, { fields: ["expiresAt"] }],
  }
);

export default PasswordResetToken;
