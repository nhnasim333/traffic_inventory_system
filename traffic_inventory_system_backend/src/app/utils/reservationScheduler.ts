import { Op } from "sequelize";
import { Reservation, Drop } from "../db/models";
import sequelize from "../db/sequelize";
import { getIO } from "../socket";

/**
 * Stock Recovery Mechanism
 *
 * Runs every 10 seconds to check for expired reservations.
 * When a reservation expires:
 *   1. Mark its status as "expired"
 *   2. Return 1 unit back to available_stock
 *   3. Decrease reserved_stock by 1
 *   4. Broadcast stock update to all connected clients via WebSocket
 *
 * This ensures that items reserved but not purchased within the 60-second
 * window are automatically returned to the available pool.
 */
export const startReservationExpiryChecker = () => {
  const INTERVAL_MS = 10_000; // Check every 10 seconds

  setInterval(async () => {
    try {
      // Find all active reservations that have passed their expiry time
      const expiredReservations = await Reservation.findAll({
        where: {
          status: "active",
          expiresAt: {
            [Op.lt]: new Date(),
          },
        },
      });

      if (expiredReservations.length === 0) return;

      // Track which drops were affected so we can broadcast updates
      const affectedDropIds = new Set<number>();

      for (const reservation of expiredReservations) {
        const transaction = await sequelize.transaction();
        try {
          // Mark reservation as expired
          await reservation.update({ status: "expired" }, { transaction });

          // Restore stock: +1 available, -1 reserved
          await Drop.increment(
            { availableStock: 1 },
            { where: { id: reservation.dropId }, transaction }
          );
          await Drop.decrement(
            { reservedStock: 1 },
            { where: { id: reservation.dropId }, transaction }
          );

          await transaction.commit();
          affectedDropIds.add(reservation.dropId);

          // Emit per-reservation expiry event
          try {
            const io = getIO();
            io.emit("reservation:expired", {
              reservationId: reservation.id,
              dropId: reservation.dropId,
              userId: reservation.userId,
            });
          } catch {
            // Socket not ready yet — skip
          }
        } catch (error) {
          try {
            await transaction.rollback();
          } catch {
            // Already finished
          }
          // eslint-disable-next-line no-console
          console.error(
            `Error expiring reservation ${reservation.id}:`,
            error
          );
        }
      }

      // Broadcast stock updates for all affected drops
      for (const dropId of affectedDropIds) {
        try {
          const updatedDrop = await Drop.findByPk(dropId);
          if (updatedDrop) {
            const io = getIO();
            io.emit("stock:update", {
              dropId: updatedDrop.id,
              availableStock: updatedDrop.availableStock,
              reservedStock: updatedDrop.reservedStock,
              totalStock: updatedDrop.totalStock,
            });
          }
        } catch {
          // Socket not ready yet — skip
        }
      }

      if (affectedDropIds.size > 0) {
        // eslint-disable-next-line no-console
        console.log(
          `Expired ${expiredReservations.length} reservation(s), restored stock for ${affectedDropIds.size} drop(s)`
        );
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error in reservation expiry checker:", error);
    }
  }, INTERVAL_MS);
};
