import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import MyReservations from "../pages/MyReservations";
import MyPurchases from "../pages/MyPurchases";
import CreateDrop from "../pages/CreateDrop";
import LoginPageRoute from "./LoginPageRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "reservations",
        element: <MyReservations />,
      },
      {
        path: "purchases",
        element: <MyPurchases />,
      },
      {
        path: "create-drop",
        element: <CreateDrop />,
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
