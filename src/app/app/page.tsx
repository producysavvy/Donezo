import { redirect } from "next/navigation";
import { ActivityFeed } from "@/components/app/ActivityFeed";
import { AppSidebar } from "@/components/app/AppSidebar";
import { CreateProjectPanel } from "@/components/app/CreateProjectPanel";
import { CreateTaskPanel } from "@/components/app/CreateTaskPanel";
import { InvitePanel } from "@/components/app/InvitePanel";
import { KanbanBoard } from "@/components/app/KanbanBoard";
import { LogoutButton } from "@/components/app/LogoutButton";
import { NotificationCenter } from "@/components/app/NotificationCenter";
import { ProjectList } from "@/components/app/ProjectList";
import { StatStrip } from "@/components/app/StatStrip";
import type {
  ActivityView,
  NotificationView,
  OrganizationView,
  ProjectView,
  TaskView,
} from "@/components/app/types";
import { requireCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { listLabels } from "@/services/label.service";
import { listNotifications } from "@/services/notification.service";
import { listOrganizations } from "@/services/organization.service";
import { listProjects } from "@/services/project.service";
import { listTasks } from "@/services/task.service";
import { taskQuerySchema } from "@/validators/task";

export default async function AppPage() {
  const { user } = await requireCurrentSession().catch(() => redirect("/login"));
  const organizations = await listOrganizations(user.id);

  if (organizations.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper p-6">
        <section className="rounded border border-line bg-white p-8 shadow-soft">
          <h1 className="text-2xl font-semibold text-ink">No workspace yet</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create an account again or accept an invite to join a workspace.
          </p>
          <div className="mt-6">
            <LogoutButton />
          </div>
        </section>
      </main>
    );
  }

  const organizationViews: OrganizationView[] = organizations.map((organization) => ({
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    role: organization.memberships[0].role,
    projectCount: organization._count.projects,
    taskCount: organization._count.tasks,
    memberCount: organization._count.memberships,
  }));
  const activeOrganization = organizationViews[0];
  const projects = await listProjects(user.id, activeOrganization.id);
  const tasksResult = await listTasks(
    user.id,
    activeOrganization.id,
    taskQuerySchema.parse({ limit: "100" }),
  );
  await listLabels(user.id, activeOrganization.id);
  const notificationsResult = await listNotifications(activeOrganization.id, user.id, {
    unreadOnly: false,
    limit: 8,
  });
  const activities = await prisma.activityLog.findMany({
    where: { organizationId: activeOrganization.id },
    include: { actor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const projectViews: ProjectView[] = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    taskCount: project._count.tasks,
  }));
  const taskViews: TaskView[] = tasksResult.items.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.toISOString() ?? null,
    assignee: task.assignee,
    labels: task.labels.map((taskLabel) => taskLabel.label),
    commentsCount: task.comments.length,
    attachmentsCount: task.attachments.length,
  }));
  const notificationViews: NotificationView[] = notificationsResult.items.map(
    (notification) => ({
      id: notification.id,
      title: notification.title,
      body: notification.body,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
    }),
  );
  const activityViews: ActivityView[] = activities.map((activity) => ({
    id: activity.id,
    action: activity.action,
    entityType: activity.entityType,
    createdAt: activity.createdAt.toISOString(),
    actor: activity.actor,
  }));

  return (
    <main className="min-h-screen bg-paper lg:grid lg:grid-cols-[18rem_1fr]">
      <AppSidebar
        userName={user.name}
        organizations={organizationViews}
        activeOrganization={activeOrganization}
      />
      <section className="min-w-0 p-4 lg:p-8">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">
              Stabilized SaaS baseline
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">
              {activeOrganization.name}
            </h1>
          </div>
          <LogoutButton />
        </header>

        <div className="space-y-6">
          <StatStrip organization={activeOrganization} tasks={taskViews} />
          <KanbanBoard tasks={taskViews} />
          <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
            <div className="space-y-6">
              <ProjectList projects={projectViews} />
              <CreateTaskPanel
                organizationId={activeOrganization.id}
                projects={projectViews}
              />
              <CreateProjectPanel organizationId={activeOrganization.id} />
            </div>
            <div className="space-y-6">
              <NotificationCenter notifications={notificationViews} />
              <ActivityFeed activities={activityViews} />
              <InvitePanel organizationId={activeOrganization.id} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
