"use client";

import { CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { NotificationView } from "@/components/app/types";

type NotificationCenterProps = {
  organizationId: string;
  notifications: NotificationView[];
};

export function NotificationCenter({
  organizationId,
  notifications,
}: NotificationCenterProps) {
  const router = useRouter();
  const [items, setItems] = useState(notifications);
  const [message, setMessage] = useState<string | null>(null);
  const unreadCount = items.filter((notification) => !notification.readAt).length;

  async function markAllRead() {
    setMessage(null);
    const response = await fetch(`/api/organizations/${organizationId}/notifications`, {
      method: "PATCH",
    });

    if (!response.ok) {
      setMessage("Could not mark notifications read");
      return;
    }

    const readAt = new Date().toISOString();
    setItems((current) =>
      current.map((notification) => ({ ...notification, readAt })),
    );
    router.refresh();
  }

  async function markRead(notificationId: string) {
    setMessage(null);
    const response = await fetch(
      `/api/organizations/${organizationId}/notifications/${notificationId}/read`,
      { method: "PATCH" },
    );

    if (!response.ok) {
      setMessage("Could not mark notification read");
      return;
    }

    const readAt = new Date().toISOString();
    setItems((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, readAt }
          : notification,
      ),
    );
    router.refresh();
  }

  return (
    <section id="notifications" className="rounded border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">Notifications</h2>
        <button
          type="button"
          onClick={() => void markAllRead()}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-2 rounded border border-line px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-50"
        >
          <CheckCheck size={14} />
          Mark read
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((notification) => (
          <div
            className="rounded border border-line p-3"
            key={notification.id}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-ink">{notification.title}</p>
              <span
                className={`rounded px-2 py-1 text-xs ${
                  notification.readAt
                    ? "bg-slate-100 text-slate-500"
                    : "bg-blue-50 text-brand"
                }`}
              >
                {notification.readAt ? "Read" : "Unread"}
              </span>
            </div>
            {notification.body ? (
              <p className="mt-2 text-sm text-slate-600">{notification.body}</p>
            ) : null}
            <p className="mt-2 text-xs text-slate-500">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
            {!notification.readAt ? (
              <button
                type="button"
                onClick={() => void markRead(notification.id)}
                className="mt-3 text-xs font-medium text-brand"
              >
                Mark this read
              </button>
            ) : null}
          </div>
        ))}
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No notifications yet.</p>
        ) : null}
      </div>
      {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
    </section>
  );
}
