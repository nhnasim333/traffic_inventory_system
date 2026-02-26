import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { Drop, Purchase, Reservation, User } from "../../db/models";
import sequelize from "../../db/sequelize";
import { getIO } from "../../socket";

/**
 * Purchase Flow
 *
 * Users can only purchase an item they have currently reserved.
 * Upon purchase:
 *   1. The reservation is marked as "completed"
 *   2. The reserved_stock is decremented (stock permanently deducted)
 *   3. A purchase record is created
 *   4. All connected clients are notified via WebSocket
 */
const createPurchase = async (userId: number, reservationId: number) => {
  const transaction = await sequelize.transaction();

  try {
    // Find active reservation belonging to this user — lock row to prevent race conditions
    const reservation = await Reservation.findOne({
      where: {
        id: reservationId,
        userId,
        status: "active",
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!reservation) {
      await transaction.rollback();
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Active reservation not found or it has already been used"
      );
    }

    // Check if reservation has expired
    if (new Date() > reservation.expiresAt) {
      // Mark as expired and restore stock
      reservation.status = "expired";
      await reservation.save({ transaction });

      await Drop.increment(
        { availableStock: 1 },
        { where: { id: reservation.dropId }, transaction }
      );
      await Drop.decrement(
        { reservedStock: 1 },
        { where: { id: reservation.dropId }, transaction }
      );

      await transaction.commit();

      // Notify clients about stock recovery
      const updatedDrop = await Drop.findByPk(reservation.dropId);
      if (updatedDrop) {
        const io = getIO();
        io.emit("stock:update", {
          dropId: updatedDrop.id,
          availableStock: updatedDrop.availableStock,
          reservedStock: updatedDrop.reservedStock,
          totalStock: updatedDrop.totalStock,
        });
      }

      throw new AppError(
        httpStatus.GONE,
        "Reservation has expired. Stock has been returned."
      );
    }

    // Mark reservation as completed
    reservation.status = "completed";
    await reservation.save({ transaction });

    // Permanently deduct stock (decrease reserved_stock since item is now sold)
    await Drop.decrement(
      { reservedStock: 1 },
      { where: { id: reservation.dropId }, transaction }
    );

    // Create purchase record
    const purchase = await Purchase.create(
      {
        userId,
        dropId: reservation.dropId,
        reservationId: reservation.id,
      },
      { transaction }
    );

    await transaction.commit();

    // Broadcast updated stock and purchase event
    const updatedDrop = await Drop.findByPk(reservation.dropId);
    const purchaseWithUser = await Purchase.findByPk(purchase.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username"],
        },
        {
          model: Drop,
          as: "drop",
          attributes: ["id", "name", "price"],
        },
      ],
    });

    if (updatedDrop) {
      const io = getIO();
      io.emit("stock:update", {
        dropId: updatedDrop.id,
        availableStock: updatedDrop.availableStock,
        reservedStock: updatedDrop.reservedStock,
        totalStock: updatedDrop.totalStock,
      });
      io.emit("purchase:completed", {
        dropId: reservation.dropId,
        purchase: purchaseWithUser,
      });
    }

    return purchaseWithUser;
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      // Transaction already finished — ignore
    }
    throw error;
  }
};

const getPurchasesByUser = async (userId: number) => {
  const purchases = await Purchase.findAll({
    where: { userId },
    include: [
      {
        model: Drop,
        as: "drop",
        attributes: ["id", "name", "price", "imageUrl"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  return purchases;
};

export const PurchaseServices = {
  createPurchase,
  getPurchasesByUser,
};
