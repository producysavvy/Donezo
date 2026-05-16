import { PrismaPg } from "@prisma/adapter-pg";
import {
  ActivityAction,
  NotificationType,
  OrgRole,
  PrismaClient,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/donezo?schema=public",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await hashPassword("Password123!");
  const users = await Promise.all(
    [
      ["owner@donezo.local", "Olivia Owner"],
      ["admin@donezo.local", "Ari Admin"],
      ["member@donezo.local", "Maya Member"],
      ["guest@donezo.local", "Gus Guest"],
    ].map(([email, name]) =>
      prisma.user.upsert({
        where: { email },
        update: { name, passwordHash },
        create: { email, name, passwordHash },
      }),
    ),
  );

  const [owner, admin, member, guest] = users;
  const existing = await prisma.organization.findUnique({
    where: { slug: "donezo-demo" },
  });

  if (existing) {
    await prisma.organization.delete({ where: { id: existing.id } });
  }

  const organization = await prisma.organization.create({
    data: {
      name: "Donezo Demo",
      slug: "donezo-demo",
      createdById: owner.id,
      memberships: {
        createMany: {
          data: [
            { userId: owner.id, role: OrgRole.OWNER },
            { userId: admin.id, role: OrgRole.ADMIN },
            { userId: member.id, role: OrgRole.MEMBER },
            { userId: guest.id, role: OrgRole.GUEST },
          ],
        },
      },
    },
  });

  const [platformLabel, customerLabel, securityLabel] = await Promise.all([
    prisma.label.create({
      data: { organizationId: organization.id, name: "Platform", color: "#2563eb" },
    }),
    prisma.label.create({
      data: { organizationId: organization.id, name: "Customer", color: "#059669" },
    }),
    prisma.label.create({
      data: { organizationId: organization.id, name: "Security", color: "#dc2626" },
    }),
  ]);

  const [coreProject, growthProject] = await Promise.all([
    prisma.project.create({
      data: {
        organizationId: organization.id,
        name: "Core product",
        description: "Authentication, tenant isolation, tasks, and audit trail.",
        createdById: owner.id,
      },
    }),
    prisma.project.create({
      data: {
        organizationId: organization.id,
        name: "Customer operations",
        description: "Notifications, file handling, and invite workflows.",
        createdById: admin.id,
      },
    }),
  ]);

  const authTask = await prisma.task.create({
    data: {
      organizationId: organization.id,
      projectId: coreProject.id,
      title: "Harden session lifecycle",
      description: "Validate cookie sessions, expiry, logout, and reset flow.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 18),
      createdById: owner.id,
      assigneeId: member.id,
      labels: { create: [{ labelId: securityLabel.id }, { labelId: platformLabel.id }] },
      watchers: { create: [{ userId: owner.id }, { userId: admin.id }] },
    },
  });

  const inviteTask = await prisma.task.create({
    data: {
      organizationId: organization.id,
      projectId: growthProject.id,
      title: "Verify guest task visibility",
      description: "Guests should only see tasks assigned to them.",
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      createdById: admin.id,
      assigneeId: guest.id,
      labels: { create: [{ labelId: customerLabel.id }] },
      watchers: { create: [{ userId: admin.id }, { userId: guest.id }] },
    },
  });

  await prisma.comment.createMany({
    data: [
      {
        organizationId: organization.id,
        taskId: authTask.id,
        authorId: owner.id,
        body: "Please keep the RBAC checks in the service layer.",
      },
      {
        organizationId: organization.id,
        taskId: inviteTask.id,
        authorId: admin.id,
        body: "This is the main tenant-boundary smoke test.",
      },
    ],
  });

  await prisma.attachment.create({
    data: {
      organizationId: organization.id,
      taskId: authTask.id,
      uploadedById: member.id,
      storageKey: "demo/session-lifecycle.md",
      fileName: "session-lifecycle.md",
      mimeType: "text/markdown",
      sizeBytes: 512,
      previewUrl: "/api/files/demo/session-lifecycle.md",
    },
  });

  await prisma.activityLog.createMany({
    data: [
      {
        organizationId: organization.id,
        actorId: owner.id,
        projectId: coreProject.id,
        action: ActivityAction.PROJECT_CREATED,
        entityType: "project",
        entityId: coreProject.id,
        metadata: { name: coreProject.name },
      },
      {
        organizationId: organization.id,
        actorId: owner.id,
        taskId: authTask.id,
        projectId: coreProject.id,
        action: ActivityAction.TASK_CREATED,
        entityType: "task",
        entityId: authTask.id,
        metadata: { title: authTask.title },
      },
      {
        organizationId: organization.id,
        actorId: admin.id,
        taskId: inviteTask.id,
        projectId: growthProject.id,
        action: ActivityAction.TASK_CREATED,
        entityType: "task",
        entityId: inviteTask.id,
        metadata: { title: inviteTask.title },
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        organizationId: organization.id,
        userId: member.id,
        actorId: owner.id,
        taskId: authTask.id,
        type: NotificationType.TASK_ASSIGNED,
        title: "Task assigned",
        body: authTask.title,
        entityType: "task",
        entityId: authTask.id,
      },
      {
        organizationId: organization.id,
        userId: guest.id,
        actorId: admin.id,
        taskId: inviteTask.id,
        type: NotificationType.TASK_ASSIGNED,
        title: "Task assigned",
        body: inviteTask.title,
        entityType: "task",
        entityId: inviteTask.id,
      },
    ],
  });

  console.info("Seeded Donezo demo data.");
  console.info("Demo password for all users: Password123!");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
