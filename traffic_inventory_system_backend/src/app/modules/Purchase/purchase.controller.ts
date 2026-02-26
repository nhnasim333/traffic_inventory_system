import { PurchaseServices } from "./purchase.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const createPurchase = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { reservationId } = req.body;
  const result = await PurchaseServices.createPurchase(userId, reservationId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Purchase completed successfully",
    data: result,
  });
});

const getUserPurchases = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await PurchaseServices.getPurchasesByUser(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Purchases retrieved successfully",
    data: result,
  });
});

export const PurchaseController = { createPurchase, getUserPurchases };
