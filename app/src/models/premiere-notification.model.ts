// app/src/models/premiere-notification.model.ts

/**
 * Modelo de Notificación de Estreno
 * ---------------------------------
 * Registra la suscripción de un usuario para ser notificado cuando una
 * película en estado "proximo_estreno" pase a "publicada" (HU-005).
 *
 * El índice único compuesto (userId + movieId) aplica a nivel de base
 * de datos la regla de no duplicidad del Escenario 3 de HU-005, además
 * de la validación que se haga en el service.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface PremiereNotificationAttributes {
  id: number;
  userId: number;
  movieId: number;
}

export interface PremiereNotificationCreationAttributes
  extends Optional<PremiereNotificationAttributes, "id"> {}

class PremiereNotification
  extends Model<PremiereNotificationAttributes, PremiereNotificationCreationAttributes>
  implements PremiereNotificationAttributes
{
  /** Identificador único de la notificación (clave primaria). */
  public id!: number;

  /** FK hacia `users.id`. */
  public userId!: number;

  /** FK hacia `movies.id`. */
  public movieId!: number;

  /** Fecha de suscripción (columna `createdAt` automática por `timestamps: true`). */
  public readonly createdAt!: Date;
}

PremiereNotification.init(
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
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "movies",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "PremiereNotification",
    tableName: "premiereNotifications",
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ["userId", "movieId"],
        name: "premiere_notifications_user_movie_unique",
      },
    ],
  }
);

export default PremiereNotification;
