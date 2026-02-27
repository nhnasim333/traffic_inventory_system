/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useCreatePurchaseMutation } from "@/redux/features/purchases/purchasesApi";

const ReservationTimer = ({ reservation, onExpired }) => {
  const [createPurchase, { isLoading }] = useCreatePurchaseMutation();
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [expired, setExpired] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const calcSeconds = () => {
      const expiresAt = new Date(reservation.expiresAt).getTime();
      const now = Date.now();
      return Math.max(0, Math.floor((expiresAt - now) / 1000));
    };

    setSecondsLeft(calcSeconds());

    intervalRef.current = setInterval(() => {
      const remaining = calcSeconds();
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        setExpired(true);
        onExpired?.(reservation.id);
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [reservation.expiresAt, reservation.id, onExpired]);

  const handlePurchase = async () => {
    const toastId = toast.loading("Completing purchase...");
    try {
      await createPurchase({ reservationId: reservation.id }).unwrap();
      toast.success("Purchase completed successfully!", {
        id: toastId,
        duration: 3000,
      });
      setPurchased(true);
      clearInterval(intervalRef.current);
    } catch (error) {
      const message =
        error?.data?.message || "Purchase failed. Your reservation may have expired.";
      toast.error(message, { id: toastId, duration: 3000 });
    }
  };

  // Timer display
  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timerDisplay = `${minutes}:${secs.toString().padStart(2, "0")}`;

  // Timer urgency color
  const timerColor =
    secondsLeft > 30
      ? "text-green-600"
      : secondsLeft > 10
      ? "text-yellow-600"
      : "text-red-600";

  if (purchased) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-green-600 font-bold text-lg">✓</span>
          <span className="font-bold text-green-700">Purchase Complete</span>
        </div>
        <p className="text-green-600 text-sm">
          {reservation.drop?.name || "Sneaker"} — ${Number(reservation.drop?.price || 0).toFixed(2)}
        </p>
      </div>
    );
  }

  if (expired || reservation.status === "expired") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 opacity-70">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-red-500 font-bold">✕</span>
          <span className="font-bold text-red-600">Reservation Expired</span>
        </div>
        <p className="text-red-500 text-sm">
          {reservation.drop?.name || "Sneaker"} — stock was returned
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-gray-800">
          {reservation.drop?.name || "Sneaker Drop"}
        </h4>
        <span className={`font-mono font-bold text-lg ${timerColor}`}>
          {timerDisplay}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 text-sm">
          Price: ${Number(reservation.drop?.price || 0).toFixed(2)}
        </span>
        <span className="text-xs text-gray-400">
          Expires: {new Date(reservation.expiresAt).toLocaleTimeString()}
        </span>
      </div>

      {/* Progress bar for timer */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
        <div
          className={`h-1.5 rounded-full transition-all duration-1000 ${
            secondsLeft > 30
              ? "bg-green-500"
              : secondsLeft > 10
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${Math.min(100, (secondsLeft / 60) * 100)}%` }}
        ></div>
      </div>

      <button
        onClick={handlePurchase}
        disabled={isLoading}
        className="w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Processing..." : "Complete Purchase"}
      </button>
    </div>
  );
};

export default ReservationTimer;
