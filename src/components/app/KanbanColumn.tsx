"use client";

import type { TaskStatus } from "@prisma/client";
import type { DragEvent } from "react";
import { KanbanCard } from "@/components/app/KanbanCard";
import type { TaskView } from "@/components/app/types";

type KanbanColumnProps = {
  value: TaskStatus;
  label: string;
  tasks: TaskView[];
  canManageTasks: boolean;
  draggedTaskId: string | null;
  onOpenTask: (taskId: string) => void;
  onCardDragEnd: () => void;
  onCardDragStart: (event: DragEvent<HTMLElement>, taskId: string) => void;
  onDropTask: (event: DragEvent<HTMLDivElement>, status: TaskStatus) => void;
};

export function KanbanColumn({
  value,
  label,
  tasks,
  canManageTasks,
  draggedTaskId,
  onOpenTask,
  onCardDragEnd,
  onCardDragStart,
  onDropTask,
}: KanbanColumnProps) {
  return (
    <div
      className={`min-h-72 rounded border border-line bg-white ${
        draggedTaskId ? "ring-1 ring-blue-100" : ""
      }`}
      onDragOver={(event) => {
        if (!canManageTasks) {
          return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDrop={(event) => onDropTask(event, value)}
    >
      <div className="border-b border-line px-3 py-2">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="text-xs text-slate-500">{tasks.length} cards</p>
      </div>
      <div className="space-y-2 p-2">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            canManageTasks={canManageTasks}
            isDragging={draggedTaskId === task.id}
            onOpen={onOpenTask}
            onDragEnd={onCardDragEnd}
            onDragStart={onCardDragStart}
          />
        ))}
      </div>
    </div>
  );
}
