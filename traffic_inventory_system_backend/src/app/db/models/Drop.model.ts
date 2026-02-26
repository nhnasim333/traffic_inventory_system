import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

export interface DropAttributes {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  dropStartsAt: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DropCreationAttributes
  extends Optional<
    DropAttributes,
    "id" | "availableStock" | "reservedStock" | "isActive" | "imageUrl"
  > {}

class Drop
  extends Model<DropAttributes, DropCreationAttributes>
  implements DropAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public price!: number;
  public imageUrl!: string | null;
  public totalStock!: number;
  public availableStock!: number;
  public reservedStock!: number;
  public dropStartsAt!: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Drop.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    totalStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    availableStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    reservedStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    dropStartsAt: {
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
    tableName: "drops",
    timestamps: true,
    underscored: true,
  }
);

export default Drop;
