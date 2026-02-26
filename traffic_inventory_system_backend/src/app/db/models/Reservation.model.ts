import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

export interface ReservationAttributes {
  id: number;
  userId: number;
  dropId: number;
  status: "active" | "expired" | "completed";
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReservationCreationAttributes
  extends Optional<ReservationAttributes, "id" | "status"> {}

class Reservation
  extends Model<ReservationAttributes, ReservationCreationAttributes>
  implements ReservationAttributes
{
  public id!: number;
  public userId!: number;
  public dropId!: number;
  public status!: "active" | "expired" | "completed";
  public expiresAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Reservation.init(
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
    status: {
      type: DataTypes.ENUM("active", "expired", "completed"),
      allowNull: false,
      defaultValue: "active",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "reservations",
    timestamps: true,
    underscored: true,
  }
);

export default Reservation;
