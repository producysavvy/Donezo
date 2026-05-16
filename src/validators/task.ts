import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";
import { optionalDateStringSchema } from "@/validators/common";

export const taskStatusSchema = z.enum([
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
  TaskStatus.CANCELED,
]);

export const taskPrioritySchema = z.enum([
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH,
  TaskPriority.URGENT,
]);

export const createTaskSchema = z.object({
  projectId: z.string().min(8),
  parentTaskId: z.string().min(8).optional().nullable(),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(8000).optional().nullable(),
  status: taskStatusSchema.default(TaskStatus.TODO),
  priority: taskPrioritySchema.default(TaskPriority.MEDIUM),
  dueDate: optionalDateStringSchema,
  assigneeId: z.string().min(8).optional().nullable(),
  labelIds: z.array(z.string().min(8)).default([]),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(2).max(180).optional(),
  description: z.string().trim().max(8000).optional().nullable(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  dueDate: optionalDateStringSchema,
  assigneeId: z.string().min(8).optional().nullable(),
  labelIds: z.array(z.string().min(8)).optional(),
  position: z.number().int().min(0).optional(),
});

export const taskQuerySchema = z.object({
  q: z.string().trim().optional(),
  projectId: z.string().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assigneeId: z.string().optional(),
  labelId: z.string().optional(),
  sort: z
    .enum(["createdAt", "updatedAt", "dueDate", "priority"])
    .default("updatedAt"),
  direction: z.enum(["asc", "desc"]).default("desc"),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

export const typingSchema = z.object({
  taskId: z.string().min(8),
});
