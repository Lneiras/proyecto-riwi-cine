// app/src/models/refresh-token.model.ts

/**
 * Modelo de Refresh Token
 * -----------------------
 * Almacena los tokens de refresco emitidos para cada usuario (JWT).
 * Permite revocar tokens y validar expiración al renovar el access token.
 * Tabla `refreshTokens`.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface RefreshTokenAttributes {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  revoked: boolean;
}

export interface RefreshTokenCreationAttributes
  extends Optional<RefreshTokenAttributes, "id" | "revoked"> {}

class RefreshToken
  extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>
  implements RefreshTokenAttributes
{
  /** Identificador único del token (clave primaria). */
  public id!: number;

  /** FK hacia `users.id`. */
  public userId!: number;

  /** Hash del token de refresco. */
  public token!: string;

  /** Fecha de expiración del token. */
  public expiresAt!: Date;

  /** Indica si el token fue revocado. */
  public revoked!: boolean;

  /** Fecha de emisión (columna `createdAt` automática por `timestamps: true`). */
  public readonly createdAt!: Date;
}

RefreshToken.init(
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
    token: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "RefreshToken",
    tableName: "refreshTokens",
    timestamps: true,
    updatedAt: false,
  }
);

export default RefreshToken;
