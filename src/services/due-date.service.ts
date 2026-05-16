import { NotificationType } from "@prisma/client";
import { addDays } from "@/services/date";
import { createNotification } from "@/services/notification.service";
import { prisma } from "@/lib/prisma";

export async function createDueDateNotifications() {
  const now = new Date();
  const soon = addDays(now, 1);
  const tasks = await prisma.task.findMany({
    where: {
      deletedAt: null,
      dueDate: {
        gte: now,
        lte: soon,
      },
      assigneeId: { not: null },
    },
    select: {
      id: true,
      title: true,
      organizationId: true,
      assigneeId: true,
      dueDate: true,
    },
  });

  const notifications = await Promise.all(
    tasks.map((task) =>
      createNotification({
        organizationId: task.organizationId,
        userId: task.assigneeId as string,
        taskId: task.id,
        type: NotificationType.DUE_DATE,
        title: "Task due soon",
        body: task.title,
        entityType: "task",
        entityId: task.id,
      }),
    ),
  );

  return {
    scanned: tasks.length,
    created: notifications.filter(Boolean).length,
  };
}
