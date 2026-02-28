/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCreateReservationMutation } from "@/redux/features/reservations/reservationsApi";

const DropCard = ({ drop, liveStock }) => {
  const [createReservation, { isLoading }] = useCreateReservationMutation();
  const [justReserved, setJustReserved] = useState(false);

  const availableStock = liveStock?.availableStock ?? drop.availableStock;
  const totalStock = liveStock?.totalStock ?? drop.totalStock;
  const reservedStock = liveStock?.reservedStock ?? drop.reservedStock;


  const [isDropStarted, setIsDropStarted] = useState(
    () => new Date(drop.dropStartsAt) <= new Date()
  );

  useEffect(() => {
    if (isDropStarted) return;

    const msUntilStart =
      new Date(drop.dropStartsAt).getTime() - Date.now();

    if (msUntilStart <= 0) {
      setIsDropStarted(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsDropStarted(true);
    }, msUntilStart);

    return () => clearTimeout(timer);
  }, [drop.dropStartsAt, isDropStarted]);

  const isSoldOut = availableStock <= 0 && reservedStock <= 0;

  const handleReserve = async () => {
    const toastId = toast.loading("Reserving...");
    try {
      await createReservation({ dropId: drop.id }).unwrap();
      toast.success("Reserved! You have 60 seconds to complete purchase.", {
        id: toastId,
        duration: 4000,
      });
      setJustReserved(true);
    } catch (error) {
      const message =
        error?.data?.message || "Failed to reserve. Try again!";
      toast.error(message, { id: toastId, duration: 3000 });
    }
  };

  const stockPercent =
    totalStock > 0
      ? Math.round((availableStock / totalStock) * 100)
      : 0;

  const barColor =
    stockPercent > 50
      ? "bg-green-500"
      : stockPercent > 20
      ? "bg-yellow-500"
      : "bg-red-500";

  const recentPurchasers = drop.purchases || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {drop.imageUrl && (
        <img
          src={drop.imageUrl}
          alt={drop.name}
          className="w-full h-44 object-cover"
        />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-800 leading-tight">
            {drop.name}
          </h3>
          <span className="text-lg font-bold text-blue-600 whitespace-nowrap ml-2">
            ${Number(drop.price).toFixed(2)}
          </span>
        </div>

        {drop.description && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">
            {drop.description}
          </p>
        )}

        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>
              {availableStock} / {totalStock} available
            </span>
            <span className="font-medium">{stockPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`${barColor} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${stockPercent}%` }}
            ></div>
          </div>
        </div>

        {!isDropStarted && (
          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded mb-3 text-center">
            Drop starts:{" "}
            {new Date(drop.dropStartsAt).toLocaleString()}
          </div>
        )}

        {isDropStarted && !isSoldOut && (
          <button
            onClick={handleReserve}
            disabled={isLoading || justReserved}
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading
              ? "Reserving..."
              : justReserved
              ? "Reserved - Go to My Reservations"
              : "Reserve Now"}
          </button>
        )}

        {isSoldOut && (
          <div className="w-full text-center py-2 rounded font-medium bg-gray-100 text-gray-500">
            Sold Out
          </div>
        )}

        {recentPurchasers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">
              Recent Purchases
            </p>
            <div className="flex flex-col gap-1">
              {recentPurchasers.map((purchase, idx) => (
                <div
                  key={purchase.id || idx}
                  className="flex items-center gap-2 text-xs text-gray-600"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                    {purchase.user?.username?.[0]?.toUpperCase() || "?"}
                  </span>
                  <span>{purchase.user?.username || "Anonymous"}</span>
                  <span className="text-gray-400 ml-auto">
                    {new Date(purchase.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropCard;
