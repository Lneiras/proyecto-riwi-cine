// app/src/models/user.model.ts

/**
 * Modelo de Usuario
 * -----------------
 * Este archivo define el modelo `User` de Sequelize, que representa la tabla `users` en la base de datos.
 *
 * Es la entidad de autenticación y perfil personal del sistema: contiene
 * credenciales, datos personales, contacto, consentimientos y referencias
 * a los catálogos relacionados con el usuario.
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

/**
 * Atributos principales de la entidad `User`.
 */
export interface UserAttributes {
  id: number;
  name: string;
  lastName: string | null;
  documentType: string | null;
  documentNumber: string | null;
  birthDate: Date | null;
  email: string;
  phone: string | null;
  passwordHash: string;
  roleId: number;
  membershipId: number;
  cityId: number | null;
  favoriteCinemaId: number | null;
  userGenreId: number | null;
  acceptDataProcessing: boolean;
  acceptTerms: boolean;
  acceptCommercialCommunications: boolean;
  emailVerified: boolean;
  accountStatus: string;
  registeredAt: Date;
}

/**
 * Los campos agregados por HU-006 quedan opcionales en el tipo de creación
 * para mantener compatibilidad con los seeds y flujos anteriores. El endpoint
 * público `/auth/register` sí los valida de acuerdo con la historia de usuario.
 */
export interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    | "id"
    | "lastName"
    | "documentType"
    | "documentNumber"
    | "birthDate"
    | "phone"
    | "favoriteCinemaId"
    | "acceptDataProcessing"
    | "acceptTerms"
    | "acceptCommercialCommunications"
    | "emailVerified"
    | "accountStatus"
    | "registeredAt"
  > {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public lastName!: string | null;
  public documentType!: string | null;
  public documentNumber!: string | null;
  public birthDate!: Date | null;
  public email!: string;
  public phone!: string | null;
  public passwordHash!: string;
  public roleId!: number;
  public membershipId!: number;
  public cityId!: number | null;
  public favoriteCinemaId!: number | null;
  public userGenreId!: number | null;
  public acceptDataProcessing!: boolean;
  public acceptTerms!: boolean;
  public acceptCommercialCommunications!: boolean;
  public emailVerified!: boolean;
  public accountStatus!: string;
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
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    documentType: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    documentNumber: {
      type: DataTypes.STRING(30),
      allowNull: true,
      unique: true,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(150),
      unique: true,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
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
    favoriteCinemaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "cinemas",
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
    acceptDataProcessing: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    acceptTerms: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    acceptCommercialCommunications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
