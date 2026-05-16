"use client";

import { X } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  dateInputToIso,
  mapComment,
  mapTask,
  type ApiComment,
  type ApiTask,
} from "@/components/app/taskMapper";
import { TaskModalAttachments } from "@/components/app/TaskModalAttachments";
import { TaskModalComments } from "@/components/app/TaskModalComments";
import { TaskModalForm } from "@/components/app/TaskModalForm";
import type { LabelView, MemberView, TaskView } from "@/components/app/types";

type TaskModalProps = {
  organizationId: string;
  task: TaskView | null;
  labels: LabelView[];
  members: MemberView[];
  canManageTasks: boolean;
  onClose: () => void;
  onTaskUpdated: (task: TaskView) => void;
};

type ApiResponse<T> = {
  data?: T;
  error?: {
    message?: string;
  };
};

export function TaskModal({
  organizationId,
  task,
  labels,
  members,
  canManageTasks,
  onClose,
  onTaskUpdated,
}: TaskModalProps) {
  const router = useRouter();
  const commentFormRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [commentMessage, setCommentMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [commentPending, setCommentPending] = useState(false);

  if (!task) {
    return null;
  }

  async function saveTask(formData: FormData) {
    if (!task) {
      return;
    }

    setPending(true);
    setMessage(null);

    const assigneeId = stringValue(formData, "assigneeId");
    const response = await fetch(
      `/api/organizations/${organizationId}/tasks/${task.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: stringValue(formData, "title"),
          description: stringValue(formData, "description") || null,
          status: stringValue(formData, "status"),
          priority: stringValue(formData, "priority"),
          dueDate: dateInputToIso(formData.get("dueDate")),
          assigneeId: assigneeId || null,
          labelIds: formData.getAll("labelIds").map(String),
        }),
      },
    );
    const body = (await response.json()) as ApiResponse<ApiTask>;
    setPending(false);

    if (!response.ok || !body.data) {
      setMessage(body.error?.message ?? "Task update failed");
      return;
    }

    onTaskUpdated(mapTask(body.data));
    setMessage("Saved");
    router.refresh();
  }

  async function addComment(formData: FormData) {
    if (!task) {
      return;
    }

    setCommentPending(true);
    setCommentMessage(null);

    const response = await fetch(
      `/api/organizations/${organizationId}/tasks/${task.id}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: stringValue(formData, "body") }),
      },
    );
    const body = (await response.json()) as ApiResponse<ApiComment>;
    setCommentPending(false);

    if (!response.ok || !body.data) {
      setCommentMessage(body.error?.message ?? "Comment failed");
      return;
    }

    const comment = mapComment(body.data);
    const comments = task.comments.some((existing) => existing.id === comment.id)
      ? task.comments
      : [...task.comments, comment];

    onTaskUpdated({
      ...task,
      comments,
      commentsCount: comments.length,
    });
    commentFormRef.current?.reset();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <section
        key={task.id}
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded border border-line bg-white p-6 shadow-soft"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand">{task.status}</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{task.title}</h2>
          </div>
          <button
            type="button"
            aria-label="Close task"
            onClick={onClose}
            className="rounded border border-line p-2 hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <TaskModalForm
          task={task}
          labels={labels}
          members={members}
          canManageTasks={canManageTasks}
          pending={pending}
          message={message}
          onSave={saveTask}
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_18rem]">
          <TaskModalComments
            task={task}
            canComment={canManageTasks}
            pending={commentPending}
            message={commentMessage}
            formRef={commentFormRef}
            onAddComment={addComment}
          />
          <TaskModalAttachments task={task} />
        </div>
      </section>
    </div>
  );
}

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
