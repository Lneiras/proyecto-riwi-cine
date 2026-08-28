// app/src/models/notification-history.model.ts

/**
 * Modelo de Historial de Notificaciones (HU-015)
 * ---------------------------------------------
 * Registra cada notificación enviada (o intentada) por el sistema,
 * permitiendo auditar el estado de entrega, el conteo de reintentos,
 * errores producidos y soporte para reenvío.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export type NotificationType =
  "account" | "purchase" | "reservation" | "marketing" | string;
export type NotificationStatus = "pending" | "processing" | "sent" | "failed";

export interface NotificationHistoryAttributes {
  id: number;
  userId: number | null;
  recipient: string;
  type: NotificationType;
  subject: string;
  bodyHtml: string | null;
  status: NotificationStatus;
  attempts: number;
  errorMessage: string | null;
  payload: Record<string, unknown> | null;
  sentAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationHistoryCreationAttributes extends Optional<
  NotificationHistoryAttributes,
  | "id"
  | "userId"
  | "bodyHtml"
  | "status"
  | "attempts"
  | "errorMessage"
  | "payload"
  | "sentAt"
> {}

class NotificationHistory
  extends Model<
    NotificationHistoryAttributes,
    NotificationHistoryCreationAttributes
  >
  implements NotificationHistoryAttributes
{
  public id!: number;
  public userId!: number | null;
  public recipient!: string;
  public type!: NotificationType;
  public subject!: string;
  public bodyHtml!: string | null;
  public status!: NotificationStatus;
  public attempts!: number;
  public errorMessage!: string | null;
  public payload!: Record<string, unknown> | null;
  public sentAt!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NotificationHistory.init(
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
    recipient: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "account",
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    bodyHtml: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending",
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: "NotificationHistory",
    tableName: "notificationHistories",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
        name: "idx_notification_history_user_id",
      },
      {
        fields: ["recipient"],
        name: "idx_notification_history_recipient",
      },
      {
        fields: ["status"],
        name: "idx_notification_history_status",
      },
    ],
  }
);

export default NotificationHistory;
