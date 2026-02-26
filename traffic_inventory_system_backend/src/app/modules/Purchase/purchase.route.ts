import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { PurchaseZodValidations } from "./purchase.validation";
import { PurchaseController } from "./purchase.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("user", "admin"),
  validateRequest(PurchaseZodValidations.createPurchaseValidationSchema),
  PurchaseController.createPurchase
);

router.get(
  "/my",
  auth("user", "admin"),
  PurchaseController.getUserPurchases
);

export const PurchaseRoutes = router;
