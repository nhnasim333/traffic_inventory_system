import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

export interface PurchaseAttributes {
  id: number;
  userId: number;
  dropId: number;
  reservationId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PurchaseCreationAttributes
  extends Optional<PurchaseAttributes, "id"> {}

class Purchase
  extends Model<PurchaseAttributes, PurchaseCreationAttributes>
  implements PurchaseAttributes
{
  public id!: number;
  public userId!: number;
  public dropId!: number;
  public reservationId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Purchase.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dropId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reservationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: "purchases",
    timestamps: true,
    underscored: true,
  }
);

export default Purchase;
