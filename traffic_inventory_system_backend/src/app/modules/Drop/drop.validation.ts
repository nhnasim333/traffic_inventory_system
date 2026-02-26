import { z } from "zod";

const createDropValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(255),
    description: z.string().min(1, "Description is required"),
    price: z.number().positive("Price must be a positive number"),
    imageUrl: z.string().url("Must be a valid URL").optional(),
    totalStock: z
      .number()
      .int("Stock must be a whole number")
      .positive("Stock must be positive"),
    dropStartsAt: z.string().datetime("Must be a valid ISO datetime string"),
  }),
});

export const DropZodValidations = {
  createDropValidationSchema,
};
