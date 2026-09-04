// app/src/models/role.model.ts

/**
 * Modelo de Rol
 * -------------
 * Catálogo de roles del sistema (ej. Cliente, Admin). Se referencia desde
 * `users.roleId` para autorización (RBAC). Tabla `roles`.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface RoleAttributes {
  id: number;
  name: string;
}

export interface RoleCreationAttributes extends Optional<RoleAttributes, "id"> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  /** Identificador único del rol (clave primaria). */
  public id!: number;

  /** Nombre del rol (ej. "Cliente", "Admin"). */
  public name!: string;
}

Role.init(
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
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "roles",
    timestamps: true,
  }
);

export default Role;
