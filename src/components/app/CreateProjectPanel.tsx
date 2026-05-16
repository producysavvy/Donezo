"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CreateProjectPanelProps = {
  organizationId: string;
  canCreateProjects: boolean;
};

export function CreateProjectPanel({
  organizationId,
  canCreateProjects,
}: CreateProjectPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function createProject(formData: FormData) {
    setMessage(null);
    const response = await fetch(`/api/organizations/${organizationId}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const body = (await response.json()) as { error?: { message: string } };

    if (!response.ok) {
      setMessage(body.error?.message ?? "Project creation failed");
      return;
    }

    router.refresh();
  }

  return (
    <section className="rounded border border-line bg-white p-4">
      <h2 className="text-lg font-semibold text-ink">Create project</h2>
      <form action={createProject} className="mt-4 space-y-3">
        <fieldset disabled={!canCreateProjects} className="space-y-3">
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            name="name"
            placeholder="Project name"
            required
          />
          <textarea
            className="min-h-20 w-full rounded border border-line px-3 py-2 text-sm"
            name="description"
            placeholder="Project description"
          />
        </fieldset>
        <button
          type="submit"
          disabled={!canCreateProjects}
          className="inline-flex items-center gap-2 rounded bg-brand px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Plus size={16} />
          Create
        </button>
      </form>
      {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
      {!canCreateProjects ? (
        <p className="mt-3 text-sm text-slate-500">Admins and owners can create projects.</p>
      ) : null}
    </section>
  );
}
