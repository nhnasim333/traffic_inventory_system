import httpStatus from "http-status";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import { Drop, Reservation } from "../../db/models";
import sequelize from "../../db/sequelize";
import { getIO } from "../../socket";
import config from "../../config";

const RESERVATION_TTL_SECONDS = config.reservation_ttl_seconds;

/**
 * Atomic Reservation System
 *
 * Uses PostgreSQL row-level locking via UPDATE ... WHERE available_stock > 0.
 * If 100 users click "Reserve" at the exact same millisecond for the last 1 item,
 * only 1 user will succeed because:
 *   1. PostgreSQL UPDATE acquires an exclusive row lock
 *   2. The WHERE clause (available_stock > 0) is re-evaluated after acquiring the lock
 *   3. After the first transaction commits (stock goes to 0), subsequent transactions
 *      will find available_stock = 0 and the UPDATE will affect 0 rows
 */
const createReservation = async (userId: number, dropId: number) => {
  const transaction = await sequelize.transaction();

  try {
    // Check if user already has an active reservation for this drop
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

    // Atomic stock decrement with row-level locking
    // This UPDATE will only succeed if available_stock > 0 and the drop is active
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

    // Create the reservation with TTL
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

    // Broadcast stock update to all connected clients
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
    // Rollback only if transaction hasn't been committed or rolled back already
    try {
      await transaction.rollback();
    } catch {
      // Transaction already finished — ignore
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
