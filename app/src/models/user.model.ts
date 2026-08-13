// app/src/models/user.model.ts

/**
 * Modelo de Usuario
 * -----------------
 * Este archivo define el modelo `User` de Sequelize, que representa la tabla `users` en la base de datos.
 *
 * Es la entidad de autenticación del sistema: contiene el hash de la
 * contraseña, rol, membresía, ciudad y género de perfil. Los catálogos
 * referenciados (`roles`, `memberships`, `userGenres`, `cities`) se
 * asocian en `src/models/index.ts`.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

/**
 * Atributos principales de la entidad `User`.
 */
export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  roleId: number;
  membershipId: number;
  cityId: number | null;
  userGenreId: number | null;
  emailVerified: boolean;
  accountStatus: string;
  registeredAt: Date;
}

/**
 * Atributos utilizados para la creación de un nuevo usuario.
 *
 * Se utiliza `Optional` para indicar que `id` no es requerido al momento
 * de la creación (autoincrementable), junto con los campos que tienen
 * valor por defecto en la base de datos.
 */
export interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    "id" | "emailVerified" | "accountStatus" | "registeredAt"
  > {}

/**
 * Clase que representa el modelo `User` en Sequelize.
 *
 * Implementa los atributos definidos en `UserAttributes` y `UserCreationAttributes`.
 */
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  /** Identificador único del usuario (clave primaria). */
  public id!: number;

  /** Nombre completo del usuario. */
  public name!: string;

  /** Dirección de correo electrónico única del usuario. */
  public email!: string;

  /** Hash (bcrypt) de la contraseña. Nunca se guarda en texto plano. */
  public passwordHash!: string;

  /** FK hacia `roles.id`. */
  public roleId!: number;

  /** FK hacia `memberships.id` (el service asigna 1 por defecto). */
  public membershipId!: number;

  /** FK hacia `cities.id` (opcional). */
  public cityId!: number | null;

  /** FK hacia `userGenres.id` (opcional). */
  public userGenreId!: number | null;

  /** Indica si el correo fue verificado. */
  public emailVerified!: boolean;

  /** Estado de la cuenta: activa, bloqueada, inactiva. */
  public accountStatus!: string;

  /** Fecha de registro. */
  public registeredAt!: Date;

  /**
   * Serialización segura del usuario: excluye `passwordHash` de cualquier
   * respuesta JSON para no exponer datos sensibles.
   */
  toJSON(): Record<string, unknown> {
    const values = { ...this.get() } as Record<string, unknown>;
    delete values.passwordHash;
    return values;
  }
}

/**
 * Inicialización del modelo `User` con la configuración de Sequelize.
 */
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      unique: true,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "roles",
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
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "cities",
        key: "id",
      },
    },
    userGenreId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "userGenres",
        key: "id",
      },
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    accountStatus: {
      type: DataTypes.STRING(20),
      defaultValue: "activa",
    },
    registeredAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  }
);

export default User;
