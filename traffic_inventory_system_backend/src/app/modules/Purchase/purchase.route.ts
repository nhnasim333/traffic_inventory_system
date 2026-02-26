import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { PurchaseZodValidations } from "./purchase.validation";
import { PurchaseController } from "./purchase.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// POST /api/v1/purchases - Complete a purchase (authenticated users)
router.post(
  "/",
  auth("user", "admin"),
  validateRequest(PurchaseZodValidations.createPurchaseValidationSchema),
  PurchaseController.createPurchase
);

// GET /api/v1/purchases/my - Get current user's purchase history
router.get(
  "/my",
  auth("user", "admin"),
  PurchaseController.getUserPurchases
);

export const PurchaseRoutes = router;
