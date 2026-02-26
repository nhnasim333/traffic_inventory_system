import { z } from "zod";

const createPurchaseValidationSchema = z.object({
  body: z.object({
    reservationId: z
      .number()
      .int("Reservation ID must be a whole number")
      .positive("Reservation ID must be positive"),
  }),
});

export const PurchaseZodValidations = {
  createPurchaseValidationSchema,
};
