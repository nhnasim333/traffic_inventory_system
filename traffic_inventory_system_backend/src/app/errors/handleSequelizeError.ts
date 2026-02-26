/* eslint-disable no-unused-vars */
import {
  UniqueConstraintError,
  ValidationError,
  ForeignKeyConstraintError,
} from "sequelize";
import { TErrorSources, TGenericErrorResponse } from "../interface/error";

export const handleSequelizeValidationError = (
  err: ValidationError
): TGenericErrorResponse => {
  const errorSources: TErrorSources = err.errors.map((e) => ({
    path: e.path || "",
    message: e.message,
  }));

  return {
    statusCode: 400,
    message: "Validation Error",
    errorSources,
  };
};

export const handleSequelizeUniqueConstraintError = (
  err: UniqueConstraintError
): TGenericErrorResponse => {
  const errorSources: TErrorSources = err.errors.map((e) => ({
    path: e.path || "",
    message: `${e.value} already exists`,
  }));

  return {
    statusCode: 409,
    message: "Duplicate Entry",
    errorSources,
  };
};

export const handleSequelizeForeignKeyError = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  err: ForeignKeyConstraintError
): TGenericErrorResponse => {
  return {
    statusCode: 400,
    message: "Foreign Key Constraint Error",
    errorSources: [
      {
        path: "",
        message: "Referenced record does not exist",
      },
    ],
  };
};
