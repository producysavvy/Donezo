"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MemberView } from "@/components/app/types";

type InvitePanelProps = {
  organizationId: string;
  canInvite: boolean;
  members: MemberView[];
};

export function InvitePanel({
  organizationId,
  canInvite,
  members,
}: InvitePanelProps) {
  const router = useRouter();
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
    };

    setMessage(
      response.ok
        ? "Invite created."
        : body.error?.message ?? "Invite failed",
    );

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <section id="members" className="rounded border border-line bg-white p-4">
      <h2 className="text-lg font-semibold text-ink">Members</h2>
      <div className="mt-4 space-y-2">
        {members.map((member) => (
          <div className="rounded border border-line p-3" key={member.membershipId}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">{member.name}</p>
                <p className="text-xs text-slate-500">{member.email}</p>
              </div>
              <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                {member.role}
              </span>
            </div>
          </div>
        ))}
        {members.length === 0 ? (
          <p className="text-sm text-slate-500">
            Member directory is available to admins and owners.
          </p>
        ) : null}
      </div>
      <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Invite
      </h3>
      <form action={invite} className="mt-3 space-y-3">
        <fieldset disabled={!canInvite} className="space-y-3">
          <input
            className="w-full rounded border border-line px-3 py-2 text-sm"
            name="email"
            type="email"
            placeholder="teammate@example.com"
            required
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
        </fieldset>
        <button
          type="submit"
          disabled={!canInvite}
          className="inline-flex items-center gap-2 rounded bg-brand px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Send size={16} />
          Invite
        </button>
      </form>
      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
      {!canInvite ? (
        <p className="mt-3 text-sm text-slate-500">Admins and owners can invite members.</p>
      ) : null}
    </section>
  );
}
