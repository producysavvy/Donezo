import type { NotificationView } from "@/components/app/types";

type NotificationCenterProps = {
  notifications: NotificationView[];
};

export function NotificationCenter({ notifications }: NotificationCenterProps) {
  return (
    <section className="rounded border border-line bg-white p-4">
      <h2 className="text-lg font-semibold text-ink">Notifications</h2>
      <div className="mt-4 space-y-3">
        {notifications.map((notification) => (
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
          </div>
        ))}
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500">No notifications yet.</p>
        ) : null}
      </div>
    </section>
  );
}
