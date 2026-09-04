// app/src/models/user-membership.model.ts

/**
 * Modelo de Membresía de Usuario (intermedia usuario ↔ membresía)
 * -----------------------------------------------------------------
 * Cada fila representa UNA membresía digital individual adquirida por un
 * usuario. Además del tipo de membresía, HU-006 exige un código único.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import { generateMembershipCode } from "../helpers/membership-code";

export interface UserMembershipAttributes {
  id: number;
  userId: number;
  membershipId: number;
  membershipCode: string | null;
  qrCode: string | null; 
  startDate: Date;
  endDate: Date | null;
  status: string;
}

export interface UserMembershipCreationAttributes
  extends Optional<UserMembershipAttributes, "id" | "membershipCode" | "qrCode"> {}

class UserMembership
  extends Model<UserMembershipAttributes, UserMembershipCreationAttributes>
  implements UserMembershipAttributes
{
  public id!: number;
  public userId!: number;
  public membershipId!: number;
  public membershipCode!: string | null;
  public qrCode!: string | null;
  public startDate!: Date;
  public endDate!: Date | null;
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
    membershipCode: {
      type: DataTypes.STRING(40),
      allowNull: true,
      unique: true,
      defaultValue: generateMembershipCode,
    },
    qrCode: {
      type: DataTypes.STRING(40),
      allowNull: true,
      unique: true,
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
