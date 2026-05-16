import type { ActivityView } from "@/components/app/types";

type ActivityFeedProps = {
  activities: ActivityView[];
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <section className="rounded border border-line bg-white p-4">
      <h2 className="text-lg font-semibold text-ink">Activity</h2>
      <div className="mt-4 space-y-3">
        {activities.map((activity) => (
          <div className="border-b border-line pb-3 last:border-0" key={activity.id}>
            <p className="text-sm font-medium text-ink">
              {activity.actor?.name ?? "System"} {activity.action.toLowerCase()}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {activity.entityType} / {new Date(activity.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        {activities.length === 0 ? (
          <p className="text-sm text-slate-500">No activity yet.</p>
        ) : null}
      </div>
    </section>
  );
}
