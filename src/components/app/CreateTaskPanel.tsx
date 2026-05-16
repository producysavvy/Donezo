"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProjectView } from "@/components/app/types";

type CreateTaskPanelProps = {
  organizationId: string;
  projects: ProjectView[];
};

export function CreateTaskPanel({
  organizationId,
  projects,
}: CreateTaskPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function createTask(formData: FormData) {
    setMessage(null);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch(`/api/organizations/${organizationId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, labelIds: [] }),
    });
    const body = (await response.json()) as { error?: { message: string } };

    if (!response.ok) {
      setMessage(body.error?.message ?? "Task creation failed");
      return;
    }

    router.refresh();
  }

  return (
    <section className="rounded border border-line bg-white p-4">
      <h2 className="text-lg font-semibold text-ink">Create task</h2>
      <form action={createTask} className="mt-4 space-y-3">
        <select
          className="w-full rounded border border-line px-3 py-2 text-sm"
          name="projectId"
          disabled={projects.length === 0}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <input
          className="w-full rounded border border-line px-3 py-2 text-sm"
          name="title"
          placeholder="Task title"
        />
        <textarea
          className="min-h-24 w-full rounded border border-line px-3 py-2 text-sm"
          name="description"
          placeholder="Task details"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            className="rounded border border-line px-3 py-2 text-sm"
            name="status"
            defaultValue="TODO"
          >
            <option value="BACKLOG">Backlog</option>
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="IN_REVIEW">Review</option>
            <option value="DONE">Done</option>
          </select>
          <select
            className="rounded border border-line px-3 py-2 text-sm"
            name="priority"
            defaultValue="MEDIUM"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={projects.length === 0}
          className="inline-flex items-center gap-2 rounded bg-brand px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Plus size={16} />
          Create
        </button>
      </form>
      {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
    </section>
  );
}
