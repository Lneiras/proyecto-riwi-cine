
// app/src/models/membership-code.model.ts

/**
 * Modelo de Código de Membresía
 * -----------------------------
 * Código único e intransferible (HU-008 Task 3), representado
 * visualmente como QR. Tabla `membershipCodes`, propiedad exclusiva
 * del módulo Membership (no toca `users`).
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface MembershipCodeAttributes {
    id: number;
    userId: number;
    code: string;
    createdAt?: Date;
}

export interface MembershipCodeCreationAttributes
    extends Optional<MembershipCodeAttributes, "id" | "createdAt"> {}

class MembershipCode
    extends Model<MembershipCodeAttributes, MembershipCodeCreationAttributes>
    implements MembershipCodeAttributes
{
    public id!: number;
    public userId!: number;
    public code!: string;
    public readonly createdAt!: Date;
}

MembershipCode.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true, // 1 código por usuario = intransferible
            references: { model: "users", key: "id" },
        },
        code: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true, // nunca se repite entre usuarios
        },
    },
    {
        sequelize,
        modelName: "MembershipCode",
        tableName: "membershipCodes",
        timestamps: true,
        updatedAt: false, // un código no se "edita", solo se crea
    }
);

export default MembershipCode;