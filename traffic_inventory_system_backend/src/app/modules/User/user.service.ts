import httpStatus from "http-status";
import bcrypt from "bcrypt";
import AppError from "../../errors/AppError";
import { TLoginUser, TUser } from "./user.interface";
import { User } from "../../db/models";
import { createToken } from "./user.utils";
import config from "../../config";

const createUserIntoDB = async (payload: TUser) => {
  // Check duplicate email
  const existingEmail = await User.findOne({ where: { email: payload.email } });
  if (existingEmail) {
    throw new AppError(httpStatus.BAD_REQUEST, "This email is already in use");
  }

  // Check duplicate username
  const existingUsername = await User.findOne({
    where: { username: payload.username },
  });
  if (existingUsername) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This username is already taken"
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  const user = await User.create({
    ...payload,
    password: hashedPassword,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
};

const loginUser = async (payload: TLoginUser) => {
  const user = await User.findOne({ where: { email: payload.email } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password
  );
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.FORBIDDEN, "Password does not match");
  }

  const jwtPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return accessToken;
};

export const UserServices = {
  createUserIntoDB,
  loginUser,
};
