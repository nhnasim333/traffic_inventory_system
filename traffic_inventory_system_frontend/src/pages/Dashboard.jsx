import { useGetDropsQuery } from "@/redux/features/drops/dropsApi";
import { useSocket } from "@/hooks/useSocket";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import DropCard from "@/components/DropCard";

const Dashboard = () => {
  const { data, isLoading, error, refetch } = useGetDropsQuery();
  const [stockMap, setStockMap] = useState({});

  const onStockUpdate = useCallback((payload) => {
    setStockMap((prev) => ({
      ...prev,
      [payload.dropId]: {
        availableStock: payload.availableStock,
        reservedStock: payload.reservedStock,
        totalStock: payload.totalStock,
      },
    }));
  }, []);

  const onPurchaseCompleted = useCallback(
    // eslint-disable-next-line no-unused-vars
    (payload) => {
      toast.info(`Someone just purchased from a drop!`);
      refetch();
    },
    [refetch]
  );

  const onReservationExpired = useCallback(() => {
    // Stock will be updated via stock:update event
  }, []);

  const onDropCreated = useCallback(
    (payload) => {
      toast.success(`New drop just landed: ${payload.name}!`);
      refetch();
    },
    [refetch]
  );

  useSocket({
    onStockUpdate,
    onPurchaseCompleted,
    onReservationExpired,
    onDropCreated,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500">Loading drops...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Failed to load drops.</p>
        <button
          onClick={refetch}
          className="mt-2 text-blue-600 hover:underline text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  const drops = data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Sneaker Drops</h2>
        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-medium">
          ● Live
        </span>
      </div>

      {drops.length === 0 ? (
        <div className="text-center py-16 bg-white rounded shadow-sm">
          <p className="text-gray-500 text-lg">No drops available yet.</p>
          <p className="text-gray-400 text-sm mt-1">
            Check back later for new sneaker drops!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drops.map((drop) => (
            <DropCard
              key={drop.id}
              drop={drop}
              liveStock={stockMap[drop.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
