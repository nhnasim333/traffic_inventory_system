import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "@/redux/features/auth/authSlice";

const SOCKET_URL = "http://localhost:5000";

/**
 * Custom hook that connects to the backend Socket.io server and
 * dispatches real-time events (stock updates, reservation expired, purchase completed)
 * back through RTK Query cache updates.
 *
 * @param {object} callbacks - { onStockUpdate, onReservationExpired, onPurchaseCompleted, onReservationCreated }
 */
export const useSocket = (callbacks = {}) => {
  const token = useSelector(selectCurrentToken);
  const socketRef = useRef(null);
  const callbacksRef = useRef(callbacks);

  // Keep callbacks ref in sync without re-connecting
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("stock:update", (data) => {
      callbacksRef.current.onStockUpdate?.(data);
    });

    socket.on("reservation:created", (data) => {
      callbacksRef.current.onReservationCreated?.(data);
    });

    socket.on("reservation:expired", (data) => {
      callbacksRef.current.onReservationExpired?.(data);
    });

    socket.on("purchase:completed", (data) => {
      callbacksRef.current.onPurchaseCompleted?.(data);
    });

    socket.on("drop:created", (data) => {
      callbacksRef.current.onDropCreated?.(data);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return socketRef;
};
