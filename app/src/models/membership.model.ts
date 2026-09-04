// app/src/models/membership.model.ts

/**
 * Modelo de Membresía
 * -------------------
 * Catálogo de membresías del usuario (ej. Bronce, Plata, Oro, Platino)
 * con sus descuentos y umbral de puntos. Tabla `memberships`.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface MembershipAttributes {
  id: number;
  name: string;
  ticketDiscount: number;
  snackDiscount: number;
  minPoints: number;
}

export interface MembershipCreationAttributes extends Optional<MembershipAttributes, "id"> {}

class Membership
  extends Model<MembershipAttributes, MembershipCreationAttributes>
  implements MembershipAttributes
{
  /** Identificador único de la membresía (clave primaria). */
  public id!: number;

  /** Nombre de la membresía (ej. "Bronce"). */
  public name!: string;

  /** Descuento sobre boletas (0-100). */
  public ticketDiscount!: number;

  /** Descuento sobre confitería (0-100). */
  public snackDiscount!: number;

  /** Umbral de puntos para alcanzar este nivel automáticamente. */
  public minPoints!: number;
}

Membership.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    ticketDiscount: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    snackDiscount: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    minPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Membership",
    tableName: "memberships",
    timestamps: true,
  }
);

export default Membership;
