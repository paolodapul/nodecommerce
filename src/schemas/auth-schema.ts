import { z } from "zod";

export const loginSchema = z
  .object({
    username: z.string(),
    password: z.string().min(8),
  })
  .strict();

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters long")
      .max(30, "Username must not exceed 30 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens"
      )
      .refine(
        (username) => !username.startsWith("-") && !username.endsWith("-"),
        "Username cannot start or end with a hyphen"
      ),
    email: z.string().email(),
    password: z.string().min(8),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
