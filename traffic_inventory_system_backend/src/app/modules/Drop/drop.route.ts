import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { DropZodValidations } from "./drop.validation";
import { DropController } from "./drop.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("admin", "user"),
  validateRequest(DropZodValidations.createDropValidationSchema),
  DropController.createDrop
);

router.get("/", DropController.getAllDrops);

router.get("/:id", DropController.getDropById);

export const DropRoutes = router;
