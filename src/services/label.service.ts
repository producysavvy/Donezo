import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/lib/rbac";
import type { createLabelSchema } from "@/validators/label";
import type { z } from "zod";

export async function listLabels(userId: string, organizationId: string) {
  await requireMembership(userId, organizationId, "task:view");

  return prisma.label.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

export async function createLabel(
  userId: string,
  organizationId: string,
  input: z.infer<typeof createLabelSchema>,
) {
  await requireMembership(userId, organizationId, "task:update");

  return prisma.label.create({
    data: {
      organizationId,
      name: input.name,
      color: input.color,
    },
  });
}
