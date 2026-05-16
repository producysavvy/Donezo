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
  LabelView,
  MemberView,
  NotificationView,
  OrganizationView,
  ProjectView,
  TaskView,
} from "@/components/app/types";
import { requireCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { hasOrgPermission } from "@/lib/rbac";
import { listLabels } from "@/services/label.service";
import { listNotifications } from "@/services/notification.service";
import {
  listAssignableMembers,
  listMembers,
  listOrganizations,
} from "@/services/organization.service";
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
  const canCreateTasks = hasOrgPermission(activeOrganization.role, "task:create");
  const canManageTasks = hasOrgPermission(activeOrganization.role, "task:update");
  const canCreateProjects = hasOrgPermission(activeOrganization.role, "project:create");
  const canManageMembers = hasOrgPermission(activeOrganization.role, "member:invite");
  const [
    projects,
    tasksResult,
    labels,
    notificationsResult,
    activities,
    assignableMemberships,
    memberRecords,
  ] = await Promise.all([
    listProjects(user.id, activeOrganization.id),
    listTasks(
      user.id,
      activeOrganization.id,
      taskQuerySchema.parse({ limit: "100" }),
    ),
    listLabels(user.id, activeOrganization.id),
    listNotifications(activeOrganization.id, user.id, {
      unreadOnly: false,
      limit: 8,
    }),
    prisma.activityLog.findMany({
      where: { organizationId: activeOrganization.id },
      include: { actor: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    canCreateTasks
      ? listAssignableMembers(user.id, activeOrganization.id)
      : Promise.resolve([]),
    canManageMembers
      ? listMembers(user.id, activeOrganization.id)
      : Promise.resolve([]),
  ]);

  const projectViews: ProjectView[] = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    taskCount: project._count.tasks,
  }));
  const labelViews: LabelView[] = labels.map((label) => ({
    id: label.id,
    name: label.name,
    color: label.color,
  }));
  const assignableMemberViews: MemberView[] = assignableMemberships.map(
    (membership) => ({
      membershipId: membership.id,
      userId: membership.user.id,
      name: membership.user.name,
      email: membership.user.email,
      role: membership.role,
    }),
  );
  const memberViews: MemberView[] = memberRecords.map((membership) => ({
    membershipId: membership.id,
    userId: membership.user.id,
    name: membership.user.name,
    email: membership.user.email,
    role: membership.role,
  }));
  const taskViews: TaskView[] = tasksResult.items.map((task) => ({
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.toISOString() ?? null,
    assignee: task.assignee,
    labels: task.labels.map((taskLabel) => taskLabel.label),
    comments: task.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      author: comment.author,
    })),
    attachments: task.attachments.map((attachment) => ({
      id: attachment.id,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      previewUrl: attachment.previewUrl,
      createdAt: attachment.createdAt.toISOString(),
    })),
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
  const boardKey = taskViews
    .map((task) => `${task.id}:${task.status}:${task.commentsCount}:${task.attachmentsCount}`)
    .join("|");
  const notificationsKey = notificationViews
    .map((notification) => `${notification.id}:${notification.readAt ?? "unread"}`)
    .join("|");

  return (
    <main className="min-h-screen bg-paper lg:grid lg:grid-cols-[18rem_1fr]">
      <AppSidebar
        userName={user.name}
        organizations={organizationViews}
        activeOrganization={activeOrganization}
      />
      <section id="dashboard" className="min-w-0 p-4 lg:p-8">
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
          <KanbanBoard
            key={boardKey}
            organizationId={activeOrganization.id}
            tasks={taskViews}
            labels={labelViews}
            members={assignableMemberViews}
            canManageTasks={canManageTasks}
          />
          <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
            <div className="space-y-6">
              <ProjectList projects={projectViews} />
              <CreateTaskPanel
                organizationId={activeOrganization.id}
                projects={projectViews}
                labels={labelViews}
                members={assignableMemberViews}
                canCreateTasks={canCreateTasks}
              />
              <CreateProjectPanel
                organizationId={activeOrganization.id}
                canCreateProjects={canCreateProjects}
              />
            </div>
            <div className="space-y-6">
              <NotificationCenter
                key={notificationsKey}
                organizationId={activeOrganization.id}
                notifications={notificationViews}
              />
              <ActivityFeed activities={activityViews} />
              <InvitePanel
                organizationId={activeOrganization.id}
                canInvite={canManageMembers}
                members={memberViews}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
