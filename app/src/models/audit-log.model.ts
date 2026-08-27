import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../config/database";

export interface AuditLogAttributes {
  id: number;
  userId: number | null;
  action: string;
  entity: string | null;
  entityId: number | null;
  ipAddress: string | null;
  detail: object | null;
}

export interface AuditLogCreationAttributes
  extends Optional<
    AuditLogAttributes,
    | "id"
    | "userId"
    | "entity"
    | "entityId"
    | "ipAddress"
    | "detail"
  > {}

class AuditLog
  extends Model<
    AuditLogAttributes,
    AuditLogCreationAttributes
  >
  implements AuditLogAttributes
{
  public id!: number;
  public userId!: number | null;
  public action!: string;
  public entity!: string | null;
  public entityId!: number | null;
  public ipAddress!: string | null;
  public detail!: object | null;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    entity: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    entityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },

    detail: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "AuditLog",
    tableName: "auditLogs",
    timestamps: true,
    updatedAt: false,
  }
);

export default AuditLog;