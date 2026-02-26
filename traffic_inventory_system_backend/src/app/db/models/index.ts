import User from "./User.model";
import Drop from "./Drop.model";
import Reservation from "./Reservation.model";
import Purchase from "./Purchase.model";

User.hasMany(Reservation, { foreignKey: "userId", as: "reservations" });
User.hasMany(Purchase, { foreignKey: "userId", as: "purchases" });

Drop.hasMany(Reservation, { foreignKey: "dropId", as: "reservations" });
Drop.hasMany(Purchase, { foreignKey: "dropId", as: "purchases" });

Reservation.belongsTo(User, { foreignKey: "userId", as: "user" });
Reservation.belongsTo(Drop, { foreignKey: "dropId", as: "drop" });
Reservation.hasOne(Purchase, { foreignKey: "reservationId", as: "purchase" });

Purchase.belongsTo(User, { foreignKey: "userId", as: "user" });
Purchase.belongsTo(Drop, { foreignKey: "dropId", as: "drop" });
Purchase.belongsTo(Reservation, {
  foreignKey: "reservationId",
  as: "reservation",
});

export { User, Drop, Reservation, Purchase };
