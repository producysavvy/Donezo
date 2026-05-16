import { ActivityAction, InvitationStatus, NotificationType, OrgRole } from "@prisma/client";
import { addDays } from "@/services/date";
import { createNotification } from "@/services/notification.service";
import { recordActivity } from "@/services/activity.service";
import { badRequest, conflict, forbidden, notFound } from "@/lib/errors";
import { createOpaqueToken, hashToken } from "@/lib/auth/tokens";
import { emailAdapter } from "@/lib/email";
import { normalizeEmail } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/lib/rbac";
import { slugify } from "@/lib/slug";
import type {
  acceptInvitationSchema,
  createOrganizationSchema,
  inviteMemberSchema,
  updateMemberSchema,
} from "@/validators/organization";
import type { z } from "zod";

export async function listOrganizations(userId: string) {
  return prisma.organization.findMany({
    where: {
      memberships: {
        some: { userId },
      },
    },
    include: {
      memberships: {
        where: { userId },
        select: { role: true },
      },
      _count: {
        select: {
          projects: true,
          tasks: true,
          memberships: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createOrganization(
  userId: string,
  input: z.infer<typeof createOrganizationSchema>,
) {
  return prisma.organization.create({
    data: {
      name: input.name,
      slug: slugify(input.name),
      createdById: userId,
      memberships: {
        create: {
          userId,
          role: OrgRole.OWNER,
        },
      },
    },
  });
}

export async function inviteMember(
  userId: string,
  organizationId: string,
  input: z.infer<typeof inviteMemberSchema>,
) {
  await requireMembership(userId, organizationId, "member:invite");

  const email = normalizeEmail(input.email);
  const token = createOpaqueToken();
  const invitation = await prisma.invitation.create({
    data: {
      organizationId,
      email,
      role: input.role,
      invitedById: userId,
      tokenHash: hashToken(token),
      expiresAt: addDays(new Date(), 7),
    },
    include: {
      organization: {
        select: { name: true },
      },
    },
  });

  await recordActivity({
    organizationId,
    actorId: userId,
    action: ActivityAction.USER_INVITED,
    entityType: "invitation",
    entityId: invitation.id,
    metadata: {
      email,
      role: input.role,
    },
  });

  const invitedUser = await prisma.user.findUnique({ where: { email } });

  if (invitedUser) {
    await createNotification({
      organizationId,
      userId: invitedUser.id,
      actorId: userId,
      type: NotificationType.INVITATION,
      title: `Invitation to ${invitation.organization.name}`,
      body: "You were invited to join a workspace.",
      entityType: "invitation",
      entityId: invitation.id,
    });
  }

  await emailAdapter.send({
    to: email,
    subject: `Invitation to ${invitation.organization.name}`,
    text: `Use this invite token to join: ${token}`,
  });

  return {
    invitation,
    token,
  };
}

export async function acceptInvitation(
  userId: string,
  userEmail: string,
  input: z.infer<typeof acceptInvitationSchema>,
) {
  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash: hashToken(input.token) },
  });

  if (!invitation || invitation.status !== InvitationStatus.PENDING) {
    throw notFound("Invitation not found");
  }

  if (invitation.expiresAt <= new Date()) {
    throw badRequest("Invitation is expired");
  }

  if (normalizeEmail(invitation.email) !== normalizeEmail(userEmail)) {
    throw forbidden("This invitation belongs to another email address");
  }

  return prisma.$transaction(async (tx) => {
    const existingMembership = await tx.organizationMembership.findUnique({
      where: {
        organizationId_userId: {
          organizationId: invitation.organizationId,
          userId,
        },
      },
    });

    if (existingMembership) {
      throw conflict("User is already a member of this organization");
    }

    const membership = await tx.organizationMembership.create({
      data: {
        organizationId: invitation.organizationId,
        userId,
        role: invitation.role,
      },
    });

    await tx.invitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    });

    return membership;
  });
}

export async function listMembers(userId: string, organizationId: string) {
  await requireMembership(userId, organizationId, "member:invite");

  return prisma.organizationMembership.findMany({
    where: { organizationId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
}

export async function listAssignableMembers(userId: string, organizationId: string) {
  await requireMembership(userId, organizationId, "task:create");

  return prisma.organizationMembership.findMany({
    where: { organizationId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
}

export async function updateMemberRole(
  userId: string,
  organizationId: string,
  membershipId: string,
  input: z.infer<typeof updateMemberSchema>,
) {
  await requireMembership(userId, organizationId, "member:remove");

  const membership = await prisma.organizationMembership.findFirst({
    where: { id: membershipId, organizationId },
  });

  if (!membership) {
    throw notFound("Member not found");
  }

  if (membership.role === OrgRole.OWNER) {
    throw badRequest("Owner role cannot be changed here");
  }

  return prisma.organizationMembership.update({
    where: { id: membershipId },
    data: { role: input.role },
  });
}

export async function removeMember(
  userId: string,
  organizationId: string,
  membershipId: string,
) {
  await requireMembership(userId, organizationId, "member:remove");

  const membership = await prisma.organizationMembership.findFirst({
    where: { id: membershipId, organizationId },
  });

  if (!membership) {
    throw notFound("Member not found");
  }

  if (membership.role === OrgRole.OWNER) {
    throw badRequest("Owners cannot be removed");
  }

  await prisma.organizationMembership.delete({
    where: { id: membershipId },
  });

  return { removed: true };
}
