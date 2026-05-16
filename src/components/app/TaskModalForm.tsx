"use client";

import { Save } from "lucide-react";
import {
  dateInputValue,
  taskPriorityOptions,
  taskStatusOptions,
} from "@/components/app/taskMapper";
import type { LabelView, MemberView, TaskView } from "@/components/app/types";

type TaskModalFormProps = {
  task: TaskView;
  labels: LabelView[];
  members: MemberView[];
  canManageTasks: boolean;
  pending: boolean;
  message: string | null;
  onSave: (formData: FormData) => void | Promise<void>;
};

export function TaskModalForm({
  task,
  labels,
  members,
  canManageTasks,
  pending,
  message,
  onSave,
}: TaskModalFormProps) {
  const selectedLabelIds = new Set(task.labels.map((label) => label.id));

  return (
    <form action={onSave} className="mt-6 space-y-4">
      <fieldset disabled={!canManageTasks || pending} className="space-y-4">
        <label className="block text-sm font-medium text-ink">
          Title
          <input
            className="mt-1 w-full rounded border border-line px-3 py-2 text-sm"
            name="title"
            defaultValue={task.title}
            required
          />
        </label>
        <label className="block text-sm font-medium text-ink">
          Description
          <textarea
            className="mt-1 min-h-28 w-full rounded border border-line px-3 py-2 text-sm"
            name="description"
            defaultValue={task.description ?? ""}
          />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label="Status" name="status" defaultValue={task.status}>
            {taskStatusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </SelectField>
          <SelectField label="Priority" name="priority" defaultValue={task.priority}>
            {taskPriorityOptions.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </SelectField>
          <label className="block text-sm font-medium text-ink">
            Due date
            <input
              className="mt-1 w-full rounded border border-line px-3 py-2 text-sm"
              name="dueDate"
              type="date"
              defaultValue={dateInputValue(task.dueDate)}
            />
          </label>
          <SelectField
            label="Assignee"
            name="assigneeId"
            defaultValue={task.assignee?.id ?? ""}
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name}
              </option>
            ))}
          </SelectField>
        </div>
        <div>
          <p className="text-sm font-medium text-ink">Labels</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {labels.map((label) => (
              <label
                className="inline-flex items-center gap-2 rounded border border-line px-2 py-1 text-xs"
                key={label.id}
              >
                <input
                  type="checkbox"
                  name="labelIds"
                  value={label.id}
                  defaultChecked={selectedLabelIds.has(label.id)}
                />
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                {label.name}
              </label>
            ))}
            {labels.length === 0 ? (
              <span className="text-sm text-slate-500">No labels</span>
            ) : null}
          </div>
        </div>
      </fieldset>
      <div className="flex items-center gap-3">
        {canManageTasks ? (
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded bg-brand px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Save size={16} />
            {pending ? "Saving" : "Save"}
          </button>
        ) : (
          <span className="text-sm text-slate-500">Read-only</span>
        )}
        {message ? <span className="text-sm text-slate-600">{message}</span> : null}
      </div>
    </form>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-ink">
      {label}
      <select
        className="mt-1 w-full rounded border border-line px-3 py-2 text-sm"
        name={name}
        defaultValue={defaultValue}
      >
        {children}
      </select>
    </label>
  );
}
