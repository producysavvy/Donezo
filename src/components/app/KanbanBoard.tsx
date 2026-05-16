"use client";

import { MessageSquare, Paperclip } from "lucide-react";
import { useMemo, useState } from "react";
import { TaskModal } from "@/components/app/TaskModal";
import type { TaskView } from "@/components/app/types";

const columns = [
  { id: "BACKLOG", label: "Backlog" },
  { id: "TODO", label: "Todo" },
  { id: "IN_PROGRESS", label: "In progress" },
  { id: "IN_REVIEW", label: "Review" },
  { id: "DONE", label: "Done" },
] as const;

type KanbanBoardProps = {
  tasks: TaskView[];
};

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const [selectedTask, setSelectedTask] = useState<TaskView | null>(null);
  const groupedTasks = useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        tasks: tasks.filter((task) => task.status === column.id),
      })),
    [tasks],
  );

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Kanban board</h2>
        <span className="text-sm text-slate-500">{tasks.length} tasks</span>
      </div>

      <div className="grid gap-3 xl:grid-cols-5">
        {groupedTasks.map((column) => (
          <div className="min-h-72 rounded border border-line bg-white" key={column.id}>
            <div className="border-b border-line px-3 py-2">
              <p className="text-sm font-semibold text-ink">{column.label}</p>
              <p className="text-xs text-slate-500">{column.tasks.length} cards</p>
            </div>
            <div className="space-y-2 p-2">
              {column.tasks.map((task) => (
                <button
                  type="button"
                  onClick={() => setSelectedTask(task)}
                  className="w-full rounded border border-line bg-paper p-3 text-left hover:border-brand"
                  key={task.id}
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
                      <MessageSquare size={14} />
                      {task.commentsCount}
                      <Paperclip size={14} />
                      {task.attachmentsCount}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
    </section>
  );
}
