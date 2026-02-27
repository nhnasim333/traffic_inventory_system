import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Register from "../pages/Register";
import Login from "../pages/Login";
import LoginPageRoute from "./LoginPageRoute";

const DashboardPlaceholder = () => (
  <div className="text-center py-10">
    <h2 className="text-xl font-bold text-gray-700">Dashboard</h2>
    <p className="text-gray-500 mt-2">Sneaker drops will appear here.</p>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <DashboardPlaceholder />,
      },
    ],
  },
  {
    path: "/register",
    element: (
      <LoginPageRoute>
        <Register />
      </LoginPageRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <LoginPageRoute>
        <Login />
      </LoginPageRoute>
    ),
  },
]);

export default router;
