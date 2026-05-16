import { z } from "zod";

export const notificationQuerySchema = z.object({
  unreadOnly: z.coerce.boolean().default(false),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});
