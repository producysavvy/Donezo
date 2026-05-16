"use client";

import { Send } from "lucide-react";
import { useState } from "react";

type InvitePanelProps = {
  organizationId: string;
};

export function InvitePanel({ organizationId }: InvitePanelProps) {
  const [message, setMessage] = useState<string | null>(null);

  async function invite(formData: FormData) {
    setMessage(null);
    const response = await fetch(`/api/organizations/${organizationId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const body = (await response.json()) as {
      error?: { message: string };
      data?: { token?: string };
    };

    setMessage(
      response.ok
        ? `Invite created. Dev token: ${body.data?.token ?? "sent"}`
        : body.error?.message ?? "Invite failed",
    );
  }

  return (
    <section className="rounded border border-line bg-white p-4">
      <h2 className="text-lg font-semibold text-ink">Invite member</h2>
      <form action={invite} className="mt-4 space-y-3">
        <input
          className="w-full rounded border border-line px-3 py-2 text-sm"
          name="email"
          type="email"
          placeholder="teammate@example.com"
        />
        <select
          className="w-full rounded border border-line px-3 py-2 text-sm"
          name="role"
          defaultValue="MEMBER"
        >
          <option value="ADMIN">Admin</option>
          <option value="MEMBER">Member</option>
          <option value="GUEST">Guest</option>
        </select>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded bg-brand px-3 py-2 text-sm font-semibold text-white"
        >
          <Send size={16} />
          Invite
        </button>
      </form>
      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
    </section>
  );
}
