"use client";

import { GripVertical, MessageSquare, Paperclip } from "lucide-react";
import type { DragEvent, KeyboardEvent } from "react";
import type { TaskView } from "@/components/app/types";

type KanbanCardProps = {
  task: TaskView;
  canManageTasks: boolean;
  isDragging: boolean;
  onOpen: (taskId: string) => void;
  onDragEnd: () => void;
  onDragStart: (event: DragEvent<HTMLElement>, taskId: string) => void;
};

export function KanbanCard({
  task,
  canManageTasks,
  isDragging,
  onOpen,
  onDragEnd,
  onDragStart,
}: KanbanCardProps) {
  function openFromKeyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      onOpen(task.id);
    }
  }

  return (
    <article
      aria-label={task.title}
      draggable={canManageTasks}
      onClick={() => onOpen(task.id)}
      onDragEnd={onDragEnd}
      onDragStart={(event) => onDragStart(event, task.id)}
      onKeyDown={openFromKeyboard}
      role="button"
      tabIndex={0}
      className={`w-full cursor-pointer rounded border border-line bg-paper p-3 text-left hover:border-brand focus:outline-none focus:ring-2 focus:ring-blue-100 ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">{task.title}</h3>
        <span className="rounded bg-white px-2 py-1 text-xs text-slate-600">
          {task.priority}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
        {task.description || "No description"}
      </p>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{task.assignee?.name ?? "Unassigned"}</span>
        <span className="flex items-center gap-2">
          {canManageTasks ? <GripVertical size={14} /> : null}
          <MessageSquare size={14} />
          {task.commentsCount}
          <Paperclip size={14} />
          {task.attachmentsCount}
        </span>
      </div>
    </article>
  );
}
