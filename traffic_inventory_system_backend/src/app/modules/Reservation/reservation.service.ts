import httpStatus from "http-status";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import { Drop, Reservation } from "../../db/models";
import sequelize from "../../db/sequelize";
import { getIO } from "../../socket";
import config from "../../config";

const RESERVATION_TTL_SECONDS = config.reservation_ttl_seconds;

const createReservation = async (userId: number, dropId: number) => {
  const transaction = await sequelize.transaction();

  try {
    // Lock the Drop row first to serialize all reservation attempts for this drop
    const drop = await Drop.findOne({
      where: {
        id: dropId,
        isActive: true,
        dropStartsAt: { [Op.lte]: new Date() },
      },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (!drop || drop.availableStock <= 0) {
      await transaction.rollback();
      throw new AppError(
        httpStatus.CONFLICT,
        "Item is out of stock or drop is not active yet"
      );
    }

    // Now the duplicate check is safe — serialized by the Drop row lock
    const existingReservation = await Reservation.findOne({
      where: {
        userId,
        dropId,
        status: "active",
        expiresAt: { [Op.gt]: new Date() },
      },
      transaction,
    });

    if (existingReservation) {
      await transaction.rollback();
      throw new AppError(
        httpStatus.CONFLICT,
        "You already have an active reservation for this drop"
      );
    }

    const [affectedRows] = await Drop.update(
      {
        availableStock: sequelize.literal("available_stock - 1"),
        reservedStock: sequelize.literal("reserved_stock + 1"),
      },
      {
        where: {
          id: dropId,
          availableStock: { [Op.gt]: 0 },
          isActive: true,
          dropStartsAt: { [Op.lte]: new Date() },
        },
        transaction,
      }
    );

    if (affectedRows === 0) {
      await transaction.rollback();
      throw new AppError(
        httpStatus.CONFLICT,
        "Item is out of stock or drop is not active yet"
      );
    }

    const expiresAt = new Date(Date.now() + RESERVATION_TTL_SECONDS * 1000);
    const reservation = await Reservation.create(
      {
        userId,
        dropId,
        status: "active",
        expiresAt,
      },
      { transaction }
    );

    await transaction.commit();

    const updatedDrop = await Drop.findByPk(dropId);
    if (updatedDrop) {
      const io = getIO();
      io.emit("stock:update", {
        dropId: updatedDrop.id,
        availableStock: updatedDrop.availableStock,
        reservedStock: updatedDrop.reservedStock,
        totalStock: updatedDrop.totalStock,
      });
      io.emit("reservation:created", {
        reservationId: reservation.id,
        dropId,
        userId,
        expiresAt: reservation.expiresAt,
      });
    }

    return reservation;
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (error) {
      // Transaction already finished
    }
    throw error;
  }
};

const getUserReservations = async (userId: number) => {
  const reservations = await Reservation.findAll({
    where: {
      userId,
      status: "active",
      expiresAt: { [Op.gt]: new Date() },
    },
    include: [
      {
        model: Drop,
        as: "drop",
        attributes: ["id", "name", "price", "imageUrl", "availableStock"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  return reservations;
};

export const ReservationServices = {
  createReservation,
  getUserReservations,
};
