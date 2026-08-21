// app/src/models/notification-preference.model.ts

/**
 * Preferencias de notificación (HU-006)
 * --------------------------------------
 * Se crean automáticamente al registrar la cuenta.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface NotificationPreferenceAttributes {
  id: number;
  userId: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  commercialEnabled: boolean;
}

export interface NotificationPreferenceCreationAttributes
  extends Optional<
    NotificationPreferenceAttributes,
    "id" | "emailEnabled" | "smsEnabled" | "commercialEnabled"
  > {}

class NotificationPreference
  extends Model<NotificationPreferenceAttributes, NotificationPreferenceCreationAttributes>
  implements NotificationPreferenceAttributes
{
  public id!: number;
  public userId!: number;
  public emailEnabled!: boolean;
  public smsEnabled!: boolean;
  public commercialEnabled!: boolean;
}

NotificationPreference.init(
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
    emailEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    smsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    commercialEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "NotificationPreference",
    tableName: "notificationPreferences",
    timestamps: true,
  }
);

export default NotificationPreference;
