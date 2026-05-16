"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  dateInputToIso,
  taskPriorityOptions,
  taskStatusOptions,
} from "@/components/app/taskMapper";
import type { LabelView, MemberView, ProjectView } from "@/components/app/types";

type CreateTaskPanelProps = {
  organizationId: string;
  projects: ProjectView[];
  labels: LabelView[];
  members: MemberView[];
  canCreateTasks: boolean;
};

export function CreateTaskPanel({
  organizationId,
  projects,
  labels,
  members,
  canCreateTasks,
}: CreateTaskPanelProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const disabled = !canCreateTasks || projects.length === 0;

  async function createTask(formData: FormData) {
    setMessage(null);
    const assigneeId = stringValue(formData, "assigneeId");
    const response = await fetch(`/api/organizations/${organizationId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: stringValue(formData, "projectId"),
        title: stringValue(formData, "title"),
        description: stringValue(formData, "description") || null,
        status: stringValue(formData, "status"),
        priority: stringValue(formData, "priority"),
        dueDate: dateInputToIso(formData.get("dueDate")),
        assigneeId: assigneeId || null,
        labelIds: formData.getAll("labelIds").map(String),
      }),
    });
    const body = (await response.json()) as { error?: { message: string } };

    if (!response.ok) {
      setMessage(body.error?.message ?? "Task creation failed");
      return;
    }

    formRef.current?.reset();
    router.refresh();
  }

  return (
    <section className="rounded border border-line bg-white p-4">
      <h2 className="text-lg font-semibold text-ink">Create task</h2>
      <form ref={formRef} action={createTask} className="mt-4 space-y-3">
        <fieldset disabled={disabled} className="space-y-3">
          <select
            className="w-full rounded border border-line px-3 py-2 text-sm"
            name="projectId"
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
            required
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
              {taskStatusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <select
              className="rounded border border-line px-3 py-2 text-sm"
              name="priority"
              defaultValue="MEDIUM"
            >
              {taskPriorityOptions.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
            <input
              className="rounded border border-line px-3 py-2 text-sm"
              name="dueDate"
              type="date"
            />
            <select
              className="rounded border border-line px-3 py-2 text-sm"
              name="assigneeId"
              defaultValue=""
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <label
                className="inline-flex items-center gap-2 rounded border border-line px-2 py-1 text-xs"
                key={label.id}
              >
                <input type="checkbox" name="labelIds" value={label.id} />
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                {label.name}
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded bg-brand px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Plus size={16} />
          Create
        </button>
      </form>
      {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
      {!canCreateTasks ? (
        <p className="mt-3 text-sm text-slate-500">Read-only for your role.</p>
      ) : null}
      {canCreateTasks && projects.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Create a project first.</p>
      ) : null}
    </section>
  );
}

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
