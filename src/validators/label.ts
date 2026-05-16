import { z } from "zod";

export const createLabelSchema = z.object({
  name: z.string().trim().min(2).max(40),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/),
});
