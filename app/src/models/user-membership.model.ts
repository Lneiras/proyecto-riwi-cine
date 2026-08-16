// app/src/models/user-membership.model.ts

/**
 * Modelo de Membresía de Usuario (intermedia usuario ↔ membresía)
 * -----------------------------------------------------------------
 * Cada fila representa UNA membresía individual adquirida por un usuario:
 * le da un identificador propio (id) e indica qué tipo de membresía
 * (membershipId) le corresponde, junto con la vigencia y el estado.
 *
 * Permite que un usuario tenga historial de membresías (activas y
 * pasadas) manteniendo `users.membershipId` como la membresía vigente.
 * Tabla `userMemberships`.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface UserMembershipAttributes {
  id: number;
  userId: number;
  membershipId: number;
  startDate: Date;
  endDate: Date | null;
  status: string;
}

export interface UserMembershipCreationAttributes
  extends Optional<UserMembershipAttributes, "id"> {}

class UserMembership
  extends Model<UserMembershipAttributes, UserMembershipCreationAttributes>
  implements UserMembershipAttributes
{
  /** Identificador individual de esta membresía adquirida. */
  public id!: number;

  /** FK hacia `users.id`. */
  public userId!: number;

  /** FK hacia `memberships.id` (tipo de membresía). */
  public membershipId!: number;

  /** Fecha de inicio de vigencia. */
  public startDate!: Date;

  /** Fecha de fin de vigencia (null = sin vencimiento). */
  public endDate!: Date | null;

  /** Estado: activa, inactiva, vencida. */
  public status!: string;
}

UserMembership.init(
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
    membershipId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "memberships",
        key: "id",
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "activa",
    },
  },
  {
    sequelize,
    modelName: "UserMembership",
    tableName: "userMemberships",
    timestamps: true,
    indexes: [
      { fields: ["userId"] },
      { fields: ["membershipId"] },
      { fields: ["status"] },
    ],
  }
);

export default UserMembership;
