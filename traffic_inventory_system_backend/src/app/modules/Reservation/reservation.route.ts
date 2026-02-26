import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { ReservationZodValidations } from "./reservation.validation";
import { ReservationController } from "./reservation.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("user", "admin"),
  validateRequest(ReservationZodValidations.createReservationValidationSchema),
  ReservationController.createReservation
);

router.get(
  "/my",
  auth("user", "admin"),
  ReservationController.getUserReservations
);

export const ReservationRoutes = router;
