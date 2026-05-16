import type { OrgRole, ProjectStatus, TaskPriority, TaskStatus } from "@prisma/client";

export type UserSummary = {
  id: string;
  name: string;
  email: string;
};

export type LabelView = {
  id: string;
  name: string;
  color: string;
};

export type CommentView = {
  id: string;
  body: string;
  createdAt: string;
  author: UserSummary;
};

export type AttachmentView = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  previewUrl: string | null;
  createdAt: string;
};

export type MemberView = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  role: OrgRole;
};

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
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assignee: UserSummary | null;
  labels: LabelView[];
  comments: CommentView[];
  attachments: AttachmentView[];
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
