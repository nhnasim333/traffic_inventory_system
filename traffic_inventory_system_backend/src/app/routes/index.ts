import express from "express";
import { UserRoutes } from "../modules/User/user.route";
import { DropRoutes } from "../modules/Drop/drop.route";
import { ReservationRoutes } from "../modules/Reservation/reservation.route";
import { PurchaseRoutes } from "../modules/Purchase/purchase.route";

const router = express.Router();

const moduleRoutes = [
  { path: "/users", route: UserRoutes },
  { path: "/drops", route: DropRoutes },
  { path: "/reservations", route: ReservationRoutes },
  { path: "/purchases", route: PurchaseRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
