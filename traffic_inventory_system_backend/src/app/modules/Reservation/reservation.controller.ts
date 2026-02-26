import { ReservationServices } from "./reservation.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const createReservation = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { dropId } = req.body;
  const result = await ReservationServices.createReservation(userId, dropId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Item reserved successfully. You have 60 seconds to complete your purchase.",
    data: result,
  });
});

const getUserReservations = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await ReservationServices.getUserReservations(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Active reservations retrieved successfully",
    data: result,
  });
});

export const ReservationController = { createReservation, getUserReservations };
