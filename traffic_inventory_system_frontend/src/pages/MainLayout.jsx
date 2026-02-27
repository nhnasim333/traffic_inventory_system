import { Outlet, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logout } from "@/redux/features/auth/authSlice";

const MainLayout = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

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
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;