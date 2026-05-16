import type { OrgRole, ProjectStatus, TaskPriority, TaskStatus } from "@prisma/client";

export type OrganizationView = {
  id: string;
  name: string;
  slug: string;
  role: OrgRole;
  projectCount: number;
  taskCount: number;
  memberCount: number;
};

export type ProjectView = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  taskCount: number;
};

export type TaskView = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assignee: { id: string; name: string; email: string } | null;
  labels: { id: string; name: string; color: string }[];
  commentsCount: number;
  attachmentsCount: number;
};

export type NotificationView = {
  id: string;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
};

export type ActivityView = {
  id: string;
  action: string;
  entityType: string;
  createdAt: string;
  actor: { name: string; email: string } | null;
};
