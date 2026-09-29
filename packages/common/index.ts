import { password } from "bun";
import z from "zod";

export const signUpSchema = z.object({
  username: z
    .string()
    .min(3, "username must be minimum of 3 letters")
    .max(20, "username must be less than 20"),
  email: z.email(),
  password: z.string(),
});

export const signInSchema = z.object({
  email: z.email(),
  password: z.string(),
});
