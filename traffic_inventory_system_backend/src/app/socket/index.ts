import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer;

export const initializeSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // eslint-disable-next-line no-console
    console.log(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      // eslint-disable-next-line no-console
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.io not initialized! Call initializeSocket first.");
  }
  return io;
};
