"use client";

import { X } from "lucide-react";
import type { TaskView } from "@/components/app/types";

type TaskModalProps = {
  task: TaskView | null;
  onClose: () => void;
};

export function TaskModal({ task, onClose }: TaskModalProps) {
  if (!task) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <section className="w-full max-w-2xl rounded border border-line bg-white p-6 shadow-soft">
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

        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {task.description || "No description yet."}
        </p>

        <dl className="mt-6 grid gap-3 text-sm md:grid-cols-2">
          <Meta label="Priority" value={task.priority} />
          <Meta label="Assignee" value={task.assignee?.name ?? "Unassigned"} />
          <Meta
            label="Due"
            value={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}
          />
          <Meta
            label="Discussion"
            value={`${task.commentsCount} comments, ${task.attachmentsCount} files`}
          />
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="rounded px-2 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line p-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}
