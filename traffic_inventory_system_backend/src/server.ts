import { createServer } from "http";
import app from "./app";
import config from "./app/config/index";
import sequelize from "./app/db/sequelize";
import { initializeSocket } from "./app/socket";
import { startReservationExpiryChecker } from "./app/utils/reservationScheduler";

// Import models to initialize associations
import "./app/db/models";

async function main() {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log("PostgreSQL connected successfully");

    // Sync database models (creates tables if they don't exist)
    // In production, use migrations instead of sync
    await sequelize.sync({ alter: config.NODE_ENV === "development" });
    // eslint-disable-next-line no-console
    console.log("Database models synced");

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.io
    initializeSocket(httpServer);
    // eslint-disable-next-line no-console
    console.log("Socket.io initialized");

    // Start reservation expiry checker (checks every 10 seconds)
    startReservationExpiryChecker();
    // eslint-disable-next-line no-console
    console.log("Reservation expiry checker started");

    httpServer.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
