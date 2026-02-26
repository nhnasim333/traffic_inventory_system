import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { DropZodValidations } from "./drop.validation";
import { DropController } from "./drop.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// POST /api/v1/drops - Create a new drop (admin only)
router.post(
  "/",
  auth("admin"),
  validateRequest(DropZodValidations.createDropValidationSchema),
  DropController.createDrop
);

// GET /api/v1/drops - Get all active drops (with top 3 purchasers)
router.get("/", DropController.getAllDrops);

// GET /api/v1/drops/:id - Get a single drop by ID
router.get("/:id", DropController.getDropById);

export const DropRoutes = router;
