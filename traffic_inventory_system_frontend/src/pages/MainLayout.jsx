import { Outlet, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { selectCurrentUser, logout } from "@/redux/features/auth/authSlice";
import { useSocket } from "@/hooks/useSocket";
import { baseApi } from "@/redux/api/baseApi";

const MainLayout = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
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
    () => {
      toast.info("Someone just purchased from a drop!");
      dispatch(baseApi.util.invalidateTags(["drops", "purchases"]));
    },
    [dispatch]
  );

  const onReservationExpired = useCallback(
    () => {
      toast.info("A reservation has expired.");
      dispatch(baseApi.util.invalidateTags(["reservations"]));
    },
    [dispatch]
  );

  const onDropCreated = useCallback(
    (payload) => {
      toast.success(`New drop just landed: ${payload.name}!`);
      dispatch(baseApi.util.invalidateTags(["drops"]));
    },
    [dispatch]
  );

  const onReservationCreated = useCallback(() => {
    dispatch(baseApi.util.invalidateTags(["reservations"]));
  }, [dispatch]);

  useSocket({
    onStockUpdate,
    onPurchaseCompleted,
    onReservationExpired,
    onDropCreated,
    onReservationCreated,
  });

  const handleLogout = () => {
    dispatch(logout());
  };

  const linkClass = ({ isActive }) =>
    `text-sm px-3 py-1 rounded transition-colors ${
      isActive
        ? "bg-blue-100 text-blue-700 font-medium"
        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
    }`;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold text-gray-800">Sneaker Drop</h1>
            <div className="flex items-center gap-2">
              <NavLink to="/" end className={linkClass}>
                Drops
              </NavLink>
              <NavLink to="/reservations" className={linkClass}>
                My Reservations
              </NavLink>
              <NavLink to="/purchases" className={linkClass}>
                My Purchases
              </NavLink>
              {user?.role === "admin" && (
                <NavLink to="/create-drop" className={linkClass}>
                  + Create Drop
                </NavLink>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-600">
                Hello, <strong>{user.username}</strong>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet context={{ stockMap }} />
      </main>
    </div>
  );
};

export default MainLayout;