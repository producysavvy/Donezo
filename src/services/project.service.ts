import { ActivityAction } from "@prisma/client";
import { recordActivity } from "@/services/activity.service";
import { notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/lib/rbac";
import type {
  createProjectSchema,
  updateProjectSchema,
} from "@/validators/project";
import type { z } from "zod";

export async function listProjects(userId: string, organizationId: string) {
  await requireMembership(userId, organizationId, "task:view");

  return prisma.project.findMany({
    where: {
      organizationId,
      deletedAt: null,
    },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createProject(
  userId: string,
  organizationId: string,
  input: z.infer<typeof createProjectSchema>,
) {
  await requireMembership(userId, organizationId, "project:create");

  const project = await prisma.project.create({
    data: {
      organizationId,
      name: input.name,
      description: input.description,
      status: input.status,
      createdById: userId,
    },
  });

  await recordActivity({
    organizationId,
    actorId: userId,
    projectId: project.id,
    action: ActivityAction.PROJECT_CREATED,
    entityType: "project",
    entityId: project.id,
    metadata: { name: project.name },
  });

  return project;
}

export async function updateProject(
  userId: string,
  organizationId: string,
  projectId: string,
  input: z.infer<typeof updateProjectSchema>,
) {
  await requireMembership(userId, organizationId, "project:update");

  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId, deletedAt: null },
  });

  if (!project) {
    throw notFound("Project not found");
  }

  return prisma.project.update({
    where: { id: projectId },
    data: input,
  });
}

export async function deleteProject(
  userId: string,
  organizationId: string,
  projectId: string,
) {
  await requireMembership(userId, organizationId, "project:delete");

  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId, deletedAt: null },
  });

  if (!project) {
    throw notFound("Project not found");
  }

  const deletedProject = await prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: new Date() },
  });

  await recordActivity({
    organizationId,
    actorId: userId,
    projectId,
    action: ActivityAction.PROJECT_DELETED,
    entityType: "project",
    entityId: projectId,
    metadata: { name: project.name },
  });

  return deletedProject;
}
