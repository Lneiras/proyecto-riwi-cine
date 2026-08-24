// app/src/models/access-log.model.ts

/**
 * Modelo de Auditoría de Accesos (HU-007)
 * ---------------------------------------
 * Registra cada evento relevante de autenticación: logins exitosos,
 * intentos fallidos, bloqueos, logout, refresh, recuperación de
 * contraseña, etc., junto con IP, dispositivo (user-agent) y timestamp.
 * Tabla `accessLogs`.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface AccessLogAttributes {
  id: number;
  userId: number | null;
  event: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface AccessLogCreationAttributes
  extends Optional<AccessLogAttributes, "id" | "userId" | "ipAddress" | "userAgent"> {}

class AccessLog
  extends Model<AccessLogAttributes, AccessLogCreationAttributes>
  implements AccessLogAttributes
{
  public id!: number;
  public userId!: number | null;

  /** Evento registrado: login_success, login_failed, lockout, logout, refresh, forgot_password, reset_password. */
  public event!: string;

  /** Dirección IP desde la que se realizó la petición. */
  public ipAddress!: string | null;

  /** Dispositivo / cliente reportado en el header User-Agent. */
  public userAgent!: string | null;

  /** Timestamp del evento (columna createdAt automática). */
  public readonly createdAt!: Date;
}

AccessLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    event: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    ipAddress: {
      type: DataTypes.STRING(64),
      allowNull: true,
      defaultValue: null,
    },
    userAgent: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: "AccessLog",
    tableName: "accessLogs",
    timestamps: true,
    updatedAt: false,
    indexes: [{ fields: ["userId"] }, { fields: ["event"] }],
  }
);

export default AccessLog;
