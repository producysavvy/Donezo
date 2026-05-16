import type { ProjectView } from "@/components/app/types";

type ProjectListProps = {
  projects: ProjectView[];
};

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <section className="rounded border border-line bg-white p-4">
      <h2 className="text-lg font-semibold text-ink">Projects</h2>
      <div className="mt-4 space-y-3">
        {projects.map((project) => (
          <div className="rounded border border-line p-3" key={project.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">{project.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {project.description ?? "No description"}
                </p>
              </div>
              <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                {project.status}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">{project.taskCount} tasks</p>
          </div>
        ))}
        {projects.length === 0 ? (
          <p className="text-sm text-slate-500">No projects yet.</p>
        ) : null}
      </div>
    </section>
  );
}
