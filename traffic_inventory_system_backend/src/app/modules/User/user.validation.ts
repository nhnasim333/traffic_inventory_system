import { z } from "zod";

const createUserValidationSchema = z.object({
  body: z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["admin", "user"]).default("user"),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required." }).email(),
    password: z.string({ required_error: "Password is required" }),
  }),
});

export const UserZodValidations = {
  createUserValidationSchema,
  loginValidationSchema,
};
