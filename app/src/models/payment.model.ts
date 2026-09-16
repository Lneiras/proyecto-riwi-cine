import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export type PaymentStatus =
  | "Aprobado"
  | "Rechazado"
  | "Reembolsado";

export interface PaymentAttributes {
  id: number;
  reservationId: number;
  paymentMethod: string;
  transactionReference: string;
  amount: number;
  paymentDate: Date;
  status: PaymentStatus;
}

export interface PaymentCreationAttributes
  extends Optional<
    PaymentAttributes,
    "id" | "paymentDate"
  > {}

class Payment
  extends Model<
    PaymentAttributes,
    PaymentCreationAttributes
  >
  implements PaymentAttributes
{
  public id!: number;
  public reservationId!: number;
  public paymentMethod!: string;
  public transactionReference!: string;
  public amount!: number;
  public paymentDate!: Date;
  public status!: PaymentStatus;
}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    reservationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    transactionReference: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Payment",
    tableName: "payments",
    timestamps: true,
  }
);

export default Payment;