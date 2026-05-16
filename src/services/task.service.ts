import {
  ActivityAction,
  NotificationType,
  OrgRole,
  Prisma,
  TaskStatus,
} from "@prisma/client";
import { recordActivity } from "@/services/activity.service";
import { createNotification } from "@/services/notification.service";
import { badRequest, forbidden, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { getStorageAdapter } from "@/lib/storage";
import { realtimeBus } from "@/lib/realtime/bus";
import {
  assertOrgPermission,
  requireMembership,
  taskVisibilityWhere,
} from "@/lib/rbac";
import type {
  createCommentSchema,
  createTaskSchema,
  taskQuerySchema,
  updateTaskSchema,
} from "@/validators/task";
import type { z } from "zod";

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  labels: { include: { label: true } },
  watchers: { include: { user: { select: { id: true, name: true, email: true } } } },
  comments: {
    where: { deletedAt: null },
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  },
  attachments: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
} satisfies Prisma.TaskInclude;

async function assertProjectInOrganization(projectId: string, organizationId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw notFound("Project not found");
  }

  return project;
}

async function assertAssignableUser(userId: string | null | undefined, organizationId: string) {
  if (!userId) {
    return;
  }

  const membership = await prisma.organizationMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    throw badRequest("Assignee must be a member of the organization");
  }
}

async function assertLabelsInOrganization(labelIds: string[], organizationId: string) {
  if (labelIds.length === 0) {
    return;
  }

  const count = await prisma.label.count({
    where: {
      id: { in: labelIds },
      organizationId,
    },
  });

  if (count !== labelIds.length) {
    throw badRequest("One or more labels do not belong to this organization");
  }
}

async function getVisibleTask(
  userId: string,
  organizationId: string,
  taskId: string,
  writePermission = false,
) {
  const membership = await requireMembership(userId, organizationId, "task:view");

  if (writePermission) {
    assertOrgPermission(membership.role, "task:update");
  }

  const task = await prisma.task.findFirst({
    where: {
      ...taskVisibilityWhere(membership),
      id: taskId,
    },
    include: taskInclude,
  });

  if (!task) {
    throw notFound("Task not found");
  }

  return { task, membership };
}

export async function listTasks(
  userId: string,
  organizationId: string,
  query: z.infer<typeof taskQuerySchema>,
) {
  const membership = await requireMembership(userId, organizationId, "task:view");
  const where: Prisma.TaskWhereInput = {
    ...taskVisibilityWhere(membership),
    projectId: query.projectId,
    status: query.status,
    priority: query.priority,
    assigneeId: query.assigneeId,
    title: query.q ? { contains: query.q, mode: "insensitive" } : undefined,
    labels: query.labelId
      ? {
          some: {
            labelId: query.labelId,
          },
        }
      : undefined,
  };

  const tasks = await prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: { [query.sort]: query.direction },
    take: query.limit + 1,
    cursor: query.cursor ? { id: query.cursor } : undefined,
    skip: query.cursor ? 1 : 0,
  });

  const nextCursor = tasks.length > query.limit ? tasks[query.limit]?.id : null;

  return {
    items: tasks.slice(0, query.limit),
    nextCursor,
  };
}

export async function getTask(
  userId: string,
  organizationId: string,
  taskId: string,
) {
  return getVisibleTask(userId, organizationId, taskId).then((result) => result.task);
}

export async function createTask(
  userId: string,
  organizationId: string,
  input: z.infer<typeof createTaskSchema>,
) {
  await requireMembership(userId, organizationId, "task:create");
  await assertProjectInOrganization(input.projectId, organizationId);
  await assertAssignableUser(input.assigneeId, organizationId);
  await assertLabelsInOrganization(input.labelIds, organizationId);

  const task = await prisma.task.create({
    data: {
      organizationId,
      projectId: input.projectId,
      parentTaskId: input.parentTaskId,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate,
      assigneeId: input.assigneeId,
      createdById: userId,
      labels: {
        create: input.labelIds.map((labelId) => ({ labelId })),
      },
      watchers: {
        create: [{ userId }],
      },
    },
    include: taskInclude,
  });

  await recordActivity({
    organizationId,
    actorId: userId,
    taskId: task.id,
    projectId: task.projectId,
    action: ActivityAction.TASK_CREATED,
    entityType: "task",
    entityId: task.id,
    metadata: { title: task.title },
  });

  if (task.assigneeId) {
    await createNotification({
      organizationId,
      userId: task.assigneeId,
      actorId: userId,
      taskId: task.id,
      type: NotificationType.TASK_ASSIGNED,
      title: "Task assigned",
      body: task.title,
      entityType: "task",
      entityId: task.id,
    });
  }

  realtimeBus.publish({
    organizationId,
    type: "task.updated",
    payload: task,
  });

  return task;
}

export async function updateTask(
  userId: string,
  organizationId: string,
  taskId: string,
  input: z.infer<typeof updateTaskSchema>,
) {
  const { task: existingTask } = await getVisibleTask(
    userId,
    organizationId,
    taskId,
    true,
  );

  await assertAssignableUser(input.assigneeId, organizationId);
  await assertLabelsInOrganization(input.labelIds ?? [], organizationId);

  const task = await prisma.$transaction(async (tx) => {
    if (input.labelIds) {
      await tx.taskLabel.deleteMany({ where: { taskId } });
      await tx.taskLabel.createMany({
        data: input.labelIds.map((labelId) => ({ taskId, labelId })),
      });
    }

    return tx.task.update({
      where: { id: taskId },
      data: {
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        dueDate: input.dueDate,
        assigneeId: input.assigneeId,
        position: input.position,
        completedAt: input.status === TaskStatus.DONE ? new Date() : undefined,
      },
      include: taskInclude,
    });
  });

  await recordActivity({
    organizationId,
    actorId: userId,
    taskId: task.id,
    projectId: task.projectId,
    action:
      input.status && input.status !== existingTask.status
        ? ActivityAction.TASK_STATUS_CHANGED
        : ActivityAction.TASK_UPDATED,
    entityType: "task",
    entityId: task.id,
    metadata: {
      title: task.title,
      previousStatus: existingTask.status,
      nextStatus: task.status,
    },
  });

  if (input.assigneeId && input.assigneeId !== existingTask.assigneeId) {
    await createNotification({
      organizationId,
      userId: input.assigneeId,
      actorId: userId,
      taskId: task.id,
      type: NotificationType.TASK_ASSIGNED,
      title: "Task assigned",
      body: task.title,
      entityType: "task",
      entityId: task.id,
    });
  }

  realtimeBus.publish({
    organizationId,
    type: "task.updated",
    payload: task,
  });

  return task;
}

export async function deleteTask(
  userId: string,
  organizationId: string,
  taskId: string,
) {
  await getVisibleTask(userId, organizationId, taskId, true);

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { deletedAt: new Date() },
  });

  await recordActivity({
    organizationId,
    actorId: userId,
    taskId,
    projectId: task.projectId,
    action: ActivityAction.TASK_UPDATED,
    entityType: "task",
    entityId: taskId,
    metadata: { deletedAt: task.deletedAt?.toISOString() },
  });

  realtimeBus.publish({
    organizationId,
    type: "task.updated",
    payload: task,
  });

  return { deleted: true };
}

export async function createComment(
  userId: string,
  organizationId: string,
  taskId: string,
  input: z.infer<typeof createCommentSchema>,
) {
  const { task, membership } = await getVisibleTask(userId, organizationId, taskId);

  if (membership.role === OrgRole.GUEST) {
    throw forbidden("Guests cannot comment on tasks");
  }

  const comment = await prisma.comment.create({
    data: {
      organizationId,
      taskId,
      authorId: userId,
      body: input.body,
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });

  await recordActivity({
    organizationId,
    actorId: userId,
    taskId,
    projectId: task.projectId,
    action: ActivityAction.COMMENT_ADDED,
    entityType: "comment",
    entityId: comment.id,
    metadata: { taskTitle: task.title },
  });

  const notifyUserIds = new Set(
    task.watchers.map((watcher) => watcher.userId).filter((id) => id !== userId),
  );
  if (task.assigneeId && task.assigneeId !== userId) {
    notifyUserIds.add(task.assigneeId);
  }

  await Promise.all(
    Array.from(notifyUserIds).map((recipientId) =>
      createNotification({
        organizationId,
        userId: recipientId,
        actorId: userId,
        taskId,
        type: NotificationType.COMMENT,
        title: "New comment",
        body: task.title,
        entityType: "comment",
        entityId: comment.id,
      }),
    ),
  );

  realtimeBus.publish({
    organizationId,
    type: "comment.created",
    payload: comment,
  });

  return comment;
}

export async function uploadAttachment(
  userId: string,
  organizationId: string,
  taskId: string,
  file: File,
) {
  const { task } = await getVisibleTask(userId, organizationId, taskId, true);
  const storage = getStorageAdapter();
  const bytes = Buffer.from(await file.arrayBuffer());
  const storedFile = await storage.put({
    organizationId,
    taskId,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    bytes,
  });

  const attachment = await prisma.attachment.create({
    data: {
      organizationId,
      taskId,
      uploadedById: userId,
      storageKey: storedFile.storageKey,
      fileName: storedFile.fileName,
      mimeType: storedFile.mimeType,
      sizeBytes: storedFile.sizeBytes,
      previewUrl: storedFile.previewUrl,
    },
  });

  await recordActivity({
    organizationId,
    actorId: userId,
    taskId,
    projectId: task.projectId,
    action: ActivityAction.FILE_UPLOADED,
    entityType: "attachment",
    entityId: attachment.id,
    metadata: { fileName: attachment.fileName },
  });

  return attachment;
}

export async function deleteAttachment(
  userId: string,
  organizationId: string,
  taskId: string,
  attachmentId: string,
) {
  const { task } = await getVisibleTask(userId, organizationId, taskId, true);
  const attachment = await prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      taskId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!attachment) {
    throw notFound("Attachment not found");
  }

  await getStorageAdapter().delete(attachment.storageKey);
  await prisma.attachment.update({
    where: { id: attachmentId },
    data: { deletedAt: new Date() },
  });

  await recordActivity({
    organizationId,
    actorId: userId,
    taskId,
    projectId: task.projectId,
    action: ActivityAction.FILE_DELETED,
    entityType: "attachment",
    entityId: attachmentId,
    metadata: { fileName: attachment.fileName },
  });

  return { deleted: true };
}

export async function emitTyping(
  userId: string,
  organizationId: string,
  taskId: string,
) {
  const { task } = await getVisibleTask(userId, organizationId, taskId);

  realtimeBus.publish({
    organizationId,
    type: "typing",
    payload: {
      taskId: task.id,
      userId,
      at: new Date().toISOString(),
    },
  });

  return { typing: true };
}
