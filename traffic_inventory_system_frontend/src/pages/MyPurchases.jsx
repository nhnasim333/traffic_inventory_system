import { useGetMyPurchasesQuery } from "@/redux/features/purchases/purchasesApi";

const MyPurchases = () => {
  const { data, isLoading, error, refetch } = useGetMyPurchasesQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500">Loading purchases...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Failed to load purchases.</p>
        <button
          onClick={refetch}
          className="mt-2 text-blue-600 hover:underline text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  const purchases = data?.data || [];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Purchases</h2>

      {purchases.length === 0 ? (
        <div className="text-center py-16 bg-white rounded shadow-sm">
          <p className="text-gray-500 text-lg">No purchases yet.</p>
          <p className="text-gray-400 text-sm mt-1">
            Complete a reservation to see your purchases here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-800">
                  {purchase.drop?.name || "Sneaker"}
                </h4>
                <span className="text-green-600 font-bold text-sm">
                  ✓ Purchased
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Price: ${Number(purchase.drop?.price || 0).toFixed(2)}
                </span>
                <span className="text-gray-400 text-xs">
                  {new Date(purchase.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPurchases;
