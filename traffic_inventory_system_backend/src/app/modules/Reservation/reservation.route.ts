import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { ReservationZodValidations } from "./reservation.validation";
import { ReservationController } from "./reservation.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// POST /api/v1/reservations - Reserve an item (authenticated users)
router.post(
  "/",
  auth("user", "admin"),
  validateRequest(ReservationZodValidations.createReservationValidationSchema),
  ReservationController.createReservation
);

// GET /api/v1/reservations/my - Get current user's active reservations
router.get(
  "/my",
  auth("user", "admin"),
  ReservationController.getUserReservations
);

export const ReservationRoutes = router;
