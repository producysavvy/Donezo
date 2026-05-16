"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";
import {
  mapComment,
  mapTask,
  type ApiComment,
  type ApiTask,
} from "@/components/app/taskMapper";
import type { TaskView } from "@/components/app/types";

type UseTaskRealtimeInput = {
  organizationId: string;
  setTasks: Dispatch<SetStateAction<TaskView[]>>;
};

export function useTaskRealtime({
  organizationId,
  setTasks,
}: UseTaskRealtimeInput) {
  useEffect(() => {
    const events = new EventSource(`/api/organizations/${organizationId}/events`);

    function onTaskUpdated(event: MessageEvent<string>) {
      const updatedTask = mapTask(JSON.parse(event.data) as ApiTask);
      setTasks((currentTasks) => upsertTask(currentTasks, updatedTask));
    }

    function onCommentCreated(event: MessageEvent<string>) {
      const payload = JSON.parse(event.data) as ApiComment & { taskId: string };
      const comment = mapComment(payload);

      setTasks((currentTasks) =>
        currentTasks.map((task) => {
          if (task.id !== payload.taskId) {
            return task;
          }

          if (task.comments.some((existing) => existing.id === comment.id)) {
            return task;
          }

          const comments = [...task.comments, comment];
          return { ...task, comments, commentsCount: comments.length };
        }),
      );
    }

    events.addEventListener("task.updated", onTaskUpdated);
    events.addEventListener("comment.created", onCommentCreated);

    return () => {
      events.removeEventListener("task.updated", onTaskUpdated);
      events.removeEventListener("comment.created", onCommentCreated);
      events.close();
    };
  }, [organizationId, setTasks]);
}

export function upsertTask(tasks: TaskView[], updatedTask: TaskView) {
  return tasks.some((task) => task.id === updatedTask.id)
    ? tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    : [updatedTask, ...tasks];
}
