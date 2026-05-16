import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { realtimeBus } from "@/lib/realtime/bus";
import { requireMembership } from "@/lib/rbac";
import type { notificationQuerySchema } from "@/validators/notification";
import type { z } from "zod";

export type CreateNotificationInput = {
  organizationId: string;
  userId: string;
  actorId?: string | null;
  taskId?: string | null;
  type: NotificationType;
  title: string;
  body?: string | null;
  entityType: string;
  entityId: string;
};

export async function createNotification(input: CreateNotificationInput) {
  if (input.actorId === input.userId) {
    return null;
  }

  const notification = await prisma.notification.create({
    data: input,
  });

  realtimeBus.publish({
    organizationId: input.organizationId,
    type: "notification.created",
    payload: notification,
  });

  return notification;
}

export async function listNotifications(
  organizationId: string,
  userId: string,
  query: z.infer<typeof notificationQuerySchema>,
) {
  await requireMembership(userId, organizationId, "task:view");

  const notifications = await prisma.notification.findMany({
    where: {
      organizationId,
      userId,
      readAt: query.unreadOnly ? null : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: query.limit + 1,
    cursor: query.cursor ? { id: query.cursor } : undefined,
    skip: query.cursor ? 1 : 0,
  });

  const nextCursor =
    notifications.length > query.limit ? notifications[query.limit]?.id : null;

  return {
    items: notifications.slice(0, query.limit),
    nextCursor,
  };
}

export async function markNotificationRead(
  organizationId: string,
  userId: string,
  notificationId: string,
) {
  await requireMembership(userId, organizationId, "task:view");

  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      organizationId,
      userId,
    },
    data: {
      readAt: new Date(),
    },
  });
}

export async function markAllNotificationsRead(
  organizationId: string,
  userId: string,
) {
  await requireMembership(userId, organizationId, "task:view");

  return prisma.notification.updateMany({
    where: {
      organizationId,
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
}
