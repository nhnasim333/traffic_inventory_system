import { useGetMyReservationsQuery } from "@/redux/features/reservations/reservationsApi";
import { useSocket } from "@/hooks/useSocket";
import { useCallback } from "react";
import { toast } from "sonner";
import ReservationTimer from "@/components/ReservationTimer";

const MyReservations = () => {
  const { data, isLoading, error, refetch } = useGetMyReservationsQuery(
    undefined,
    { pollingInterval: 10000 }
  );

  const onReservationExpired = useCallback(() => {
    toast.info("A reservation has expired.");
    refetch();
  }, [refetch]);

  const onStockUpdate = useCallback(() => {
    // no-op — handled by dashboard
  }, []);

  useSocket({ onReservationExpired, onStockUpdate });

  const handleExpired = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500">Loading reservations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Failed to load reservations.</p>
        <button
          onClick={refetch}
          className="mt-2 text-blue-600 hover:underline text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  const reservations = data?.data || [];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        My Reservations
      </h2>

      {reservations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded shadow-sm">
          <p className="text-gray-500 text-lg">No active reservations.</p>
          <p className="text-gray-400 text-sm mt-1">
            Reserve a sneaker from the dashboard to see it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reservations.map((reservation) => (
            <ReservationTimer
              key={reservation.id}
              reservation={reservation}
              onExpired={handleExpired}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReservations;
