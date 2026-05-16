import { z } from "zod";

export const idSchema = z.string().min(8);

export const dateStringSchema = z
  .string()
  .datetime()
  .transform((value) => new Date(value));

export const optionalDateStringSchema = z
  .string()
  .datetime()
  .transform((value) => new Date(value))
  .nullable()
  .optional();
