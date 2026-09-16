import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface ReservationProductAttributes {
  id: number;
  reservationId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ReservationProductCreationAttributes
  extends Optional<ReservationProductAttributes, "id"> {}

class ReservationProduct
  extends Model<
    ReservationProductAttributes,
    ReservationProductCreationAttributes
  >
  implements ReservationProductAttributes
{
  public id!: number;
  public reservationId!: number;
  public productId!: number;
  public quantity!: number;
  public unitPrice!: number;
  public subtotal!: number;
}

ReservationProduct.init(
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

    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },

    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    modelName: "ReservationProduct",
    tableName: "reservation_products",
    timestamps: true,
  }
);

export default ReservationProduct;