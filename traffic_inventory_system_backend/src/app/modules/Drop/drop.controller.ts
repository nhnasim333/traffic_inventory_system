import { DropServices } from "./drop.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";

const createDrop = catchAsync(async (req, res) => {
  const result = await DropServices.createDrop(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Drop created successfully",
    data: result,
  });
});

const getAllDrops = catchAsync(async (req, res) => {
  const result = await DropServices.getAllDrops();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Drops retrieved successfully",
    data: result,
  });
});

const getDropById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DropServices.getDropById(Number(id));
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Drop not found");
  }
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Drop retrieved successfully",
    data: result,
  });
});

export const DropController = { createDrop, getAllDrops, getDropById };
