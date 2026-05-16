import type { OrganizationView, TaskView } from "@/components/app/types";

type StatStripProps = {
  organization: OrganizationView;
  tasks: TaskView[];
};

export function StatStrip({ organization, tasks }: StatStripProps) {
  const done = tasks.filter((task) => task.status === "DONE").length;
  const urgent = tasks.filter((task) => task.priority === "URGENT").length;

  return (
    <section className="grid gap-3 md:grid-cols-4">
      <Stat label="Projects" value={organization.projectCount} />
      <Stat label="Tasks" value={organization.taskCount} />
      <Stat label="Completed" value={done} />
      <Stat label="Urgent" value={urgent} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-line bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
