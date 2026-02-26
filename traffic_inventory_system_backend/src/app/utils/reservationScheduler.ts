import { Op } from "sequelize";
import { Reservation, Drop } from "../db/models";
import sequelize from "../db/sequelize";
import { getIO } from "../socket";

export const startReservationExpiryChecker = () => {
  const INTERVAL_MS = 10_000;

  setInterval(async () => {
    try {
      const expiredReservations = await Reservation.findAll({
        where: {
          status: "active",
          expiresAt: {
            [Op.lt]: new Date(),
          },
        },
      });

      if (expiredReservations.length === 0) return;

      const affectedDropIds = new Set<number>();

      for (const reservation of expiredReservations) {
        const transaction = await sequelize.transaction();
        try {
          await reservation.update({ status: "expired" }, { transaction });

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

          try {
            const io = getIO();
            io.emit("reservation:expired", {
              reservationId: reservation.id,
              dropId: reservation.dropId,
              userId: reservation.userId,
            });
          } catch (error) {
            // Socket not ready yet
          }
        } catch (error) {
          try {
            await transaction.rollback();
          } catch (error) {
            // Already finished
          }
          // eslint-disable-next-line no-console
          console.error(
            `Error expiring reservation ${reservation.id}:`,
            error
          );
        }
      }
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
        } catch (error) {
          // Socket not ready yet
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
