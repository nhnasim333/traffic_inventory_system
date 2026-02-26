import { z } from "zod";

const createReservationValidationSchema = z.object({
  body: z.object({
    dropId: z
      .number()
      .int("Drop ID must be a whole number")
      .positive("Drop ID must be positive"),
  }),
});

export const ReservationZodValidations = {
  createReservationValidationSchema,
};
