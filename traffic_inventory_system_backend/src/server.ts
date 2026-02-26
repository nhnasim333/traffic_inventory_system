import { createServer } from "http";
import app from "./app";
import config from "./app/config/index";
import sequelize from "./app/db/sequelize";
import { initializeSocket } from "./app/socket";
import { startReservationExpiryChecker } from "./app/utils/reservationScheduler";
import "./app/db/models";

async function main() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully");

    await sequelize.sync({ alter: config.NODE_ENV === "development" });
    console.log("Database models synced");

    const httpServer = createServer(app);

    initializeSocket(httpServer);
    console.log("Socket.io initialized");

    startReservationExpiryChecker();
    console.log("Reservation expiry checker started");

    httpServer.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
