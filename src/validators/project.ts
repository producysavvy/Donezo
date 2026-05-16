import { ProjectStatus } from "@prisma/client";
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional(),
  status: z
    .enum([
      ProjectStatus.PLANNED,
      ProjectStatus.ACTIVE,
      ProjectStatus.PAUSED,
      ProjectStatus.COMPLETED,
      ProjectStatus.ARCHIVED,
    ])
    .default(ProjectStatus.ACTIVE),
});

export const updateProjectSchema = createProjectSchema.partial();
