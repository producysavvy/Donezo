import type { TaskPriority, TaskStatus } from "@prisma/client";
import type { AttachmentView, CommentView, LabelView, TaskView, UserSummary } from "./types";

export const taskStatusOptions: { value: TaskStatus; label: string }[] = [
  { value: "BACKLOG", label: "Backlog" },
  { value: "TODO", label: "Todo" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "IN_REVIEW", label: "Review" },
  { value: "DONE", label: "Done" },
  { value: "CANCELED", label: "Canceled" },
];

export const taskPriorityOptions: { value: TaskPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

type ApiDate = string | Date | null | undefined;

export type ApiTask = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: ApiDate;
  assignee: UserSummary | null;
  labels: { label: LabelView }[];
  comments?: {
    id: string;
    body: string;
    createdAt: ApiDate;
    author: UserSummary;
  }[];
  attachments?: {
    id: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    previewUrl: string | null;
    createdAt: ApiDate;
  }[];
};

export type ApiComment = {
  id: string;
  body: string;
  createdAt: ApiDate;
  author: UserSummary;
};

function isoDate(value: ApiDate) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.toISOString();
}

export function mapComment(comment: ApiComment): CommentView {
  return {
    id: comment.id,
    body: comment.body,
    createdAt: isoDate(comment.createdAt) ?? new Date().toISOString(),
    author: comment.author,
  };
}

export function mapTask(task: ApiTask): TaskView {
  const comments = (task.comments ?? []).map(mapComment);
  const attachments: AttachmentView[] = (task.attachments ?? []).map((attachment) => ({
    id: attachment.id,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes,
    previewUrl: attachment.previewUrl,
    createdAt: isoDate(attachment.createdAt) ?? new Date().toISOString(),
  }));

  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: isoDate(task.dueDate),
    assignee: task.assignee,
    labels: task.labels.map((taskLabel) => taskLabel.label),
    comments,
    attachments,
    commentsCount: comments.length,
    attachmentsCount: attachments.length,
  };
}

export function dateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

export function dateInputToIso(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  return `${value}T12:00:00.000Z`;
}
