import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export type DiscountType = "percentage" | "fixed";

export interface SnackPromotionAttributes {
    id: number;
    snackId: number | null;
    snackCategoryId: number | null;
    discountType: DiscountType;
    discountValue: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}

export interface SnackPromotionCreationAttributes
    extends Optional<
        SnackPromotionAttributes,
        "id" | "snackId" | "snackCategoryId" | "isActive"
    > {}

class SnackPromotion
    extends Model<SnackPromotionAttributes, SnackPromotionCreationAttributes>
    implements SnackPromotionAttributes
{
    /** Identificador único de la promoción (clave primaria). */
    public id!: number;
    /** FK opcional: promoción aplicada a un solo producto. */
    public snackId!: number | null;
    /** FK opcional: promoción aplicada a toda una categoría. */
    public snackCategoryId!: number | null;
    /** Tipo de descuento: porcentaje o monto fijo. */
    public discountType!: DiscountType;
    /** Valor del descuento (según el tipo). */
    public discountValue!: number;
    /** Fecha/hora de inicio de vigencia. */
    public startDate!: Date;
    /** Fecha/hora de fin de vigencia. */
    public endDate!: Date;
    /** Permite desactivar la promoción manualmente antes de su fecha fin. */
    public isActive!: boolean;
}

SnackPromotion.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        snackId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        snackCategoryId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        discountType: {
            type: DataTypes.ENUM("percentage", "fixed"),
            allowNull: false,
        },
        discountValue: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: { min: 0 },
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: "SnackPromotion",
        tableName: "snackPromotions",
        timestamps: true,
        validate: {
            // Regla de negocio: la promoción debe apuntar a un snack O a una categoría
            mustReferenceSnackOrCategory() {
                if (!this.snackId && !this.snackCategoryId) {
                    throw new Error(
                        "snackPromotion debe referenciar snackId o snackCategoryId"
                    );
                }
            },
        },
    }
);

export default SnackPromotion;