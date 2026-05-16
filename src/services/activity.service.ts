import type { ActivityAction, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { realtimeBus } from "@/lib/realtime/bus";

export type ActivityInput = {
  organizationId: string;
  actorId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
};

export async function recordActivity(input: ActivityInput) {
  const activity = await prisma.activityLog.create({
    data: {
      organizationId: input.organizationId,
      actorId: input.actorId,
      projectId: input.projectId,
      taskId: input.taskId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata ?? {},
    },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  realtimeBus.publish({
    organizationId: input.organizationId,
    type: "activity.created",
    payload: activity,
  });

  return activity;
}
