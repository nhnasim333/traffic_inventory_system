import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import AppError from "../errors/AppError";
import catchAsync from "../utils/catchAsync";
import { TUserRole } from "../modules/User/user.interface";
import { User } from "../db/models";

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string
      ) as JwtPayload;
    } catch (error) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
    }

    const { userId, role } = decoded;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You do not have permission to perform this action"
      );
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

export default auth;
