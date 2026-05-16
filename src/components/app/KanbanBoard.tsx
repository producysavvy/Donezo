"use client";

import type { TaskStatus } from "@prisma/client";
import { Lock } from "lucide-react";
import type { DragEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KanbanColumn } from "@/components/app/KanbanColumn";
import { TaskModal } from "@/components/app/TaskModal";
import { mapTask, taskStatusOptions, type ApiTask } from "@/components/app/taskMapper";
import type { LabelView, MemberView, TaskView } from "@/components/app/types";
import { upsertTask, useTaskRealtime } from "@/components/app/useTaskRealtime";

type KanbanBoardProps = {
  organizationId: string;
  tasks: TaskView[];
  labels: LabelView[];
  members: MemberView[];
  canManageTasks: boolean;
};

type ApiSuccess<T> = {
  data: T;
};

type ApiFailure = {
  error?: {
    message?: string;
  };
};

export function KanbanBoard({
  organizationId,
  tasks,
  labels,
  members,
  canManageTasks,
}: KanbanBoardProps) {
  const router = useRouter();
  const [boardTasks, setBoardTasks] = useState(tasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const selectedTask =
    boardTasks.find((task) => task.id === selectedTaskId) ?? null;

  useTaskRealtime({ organizationId, setTasks: setBoardTasks });

  const groupedTasks = useMemo(
    () =>
      taskStatusOptions.map((column) => ({
        ...column,
        tasks: boardTasks.filter((task) => task.status === column.value),
      })),
    [boardTasks],
  );

  async function moveTask(taskId: string, status: TaskStatus) {
    if (!canManageTasks) {
      return;
    }

    const existingTask = boardTasks.find((task) => task.id === taskId);
    if (!existingTask || existingTask.status === status) {
      return;
    }

    const previousTasks = boardTasks;
    setMessage(null);
    setBoardTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status } : task,
      ),
    );

    const response = await fetch(
      `/api/organizations/${organizationId}/tasks/${taskId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    const body = (await response.json()) as ApiSuccess<ApiTask> & ApiFailure;

    if (!response.ok) {
      setBoardTasks(previousTasks);
      setMessage(body.error?.message ?? "Task update failed");
      return;
    }

    setBoardTasks((currentTasks) => upsertTask(currentTasks, mapTask(body.data)));
    router.refresh();
  }

  function updateTask(updatedTask: TaskView) {
    setBoardTasks((currentTasks) => upsertTask(currentTasks, updatedTask));
  }

  function startDrag(event: DragEvent<HTMLElement>, taskId: string) {
    if (!canManageTasks) {
      return;
    }

    event.dataTransfer.setData("text/plain", taskId);
    event.dataTransfer.effectAllowed = "move";
    setDraggedTaskId(taskId);
  }

  function dropTask(event: DragEvent<HTMLDivElement>, status: TaskStatus) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain");
    setDraggedTaskId(null);
    void moveTask(taskId, status);
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Kanban board</h2>
        <span className="flex items-center gap-2 text-sm text-slate-500">
          {!canManageTasks ? <Lock size={14} /> : null}
          {boardTasks.length} tasks
        </span>
      </div>
      {message ? <p className="mb-3 text-sm text-red-600">{message}</p> : null}

      <div className="grid gap-3 xl:grid-cols-6">
        {groupedTasks.map((column) => (
          <KanbanColumn
            key={column.value}
            value={column.value}
            label={column.label}
            tasks={column.tasks}
            canManageTasks={canManageTasks}
            draggedTaskId={draggedTaskId}
            onOpenTask={setSelectedTaskId}
            onCardDragEnd={() => setDraggedTaskId(null)}
            onCardDragStart={startDrag}
            onDropTask={dropTask}
          />
        ))}
      </div>

      <TaskModal
        organizationId={organizationId}
        task={selectedTask}
        labels={labels}
        members={members}
        canManageTasks={canManageTasks}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={updateTask}
      />
    </section>
  );
}
