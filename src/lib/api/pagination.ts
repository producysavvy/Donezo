import { z } from "zod";

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export function paginationFromUrl(url: string): PaginationInput {
  const params = Object.fromEntries(new URL(url).searchParams.entries());
  return paginationSchema.parse(params);
}
