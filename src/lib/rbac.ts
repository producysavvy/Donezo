import { OrgRole, type OrganizationMembership } from "@prisma/client";
import { forbidden, notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const roleRank: Record<OrgRole, number> = {
  GUEST: 0,
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

export type OrgPermission =
  | "organization:manage"
  | "member:invite"
  | "member:remove"
  | "project:create"
  | "project:update"
  | "project:delete"
  | "task:create"
  | "task:update"
  | "task:comment"
  | "task:upload"
  | "task:view";

export function hasOrgPermission(role: OrgRole, permission: OrgPermission) {
  switch (permission) {
    case "organization:manage":
    case "project:delete":
      return role === "OWNER";
    case "member:invite":
    case "member:remove":
    case "project:create":
    case "project:update":
      return roleRank[role] >= roleRank.ADMIN;
    case "task:create":
    case "task:update":
    case "task:comment":
    case "task:upload":
      return roleRank[role] >= roleRank.MEMBER;
    case "task:view":
      return true;
  }
}

export function assertOrgPermission(role: OrgRole, permission: OrgPermission) {
  if (!hasOrgPermission(role, permission)) {
    throw forbidden();
  }
}

export async function getMembership(userId: string, organizationId: string) {
  const membership = await prisma.organizationMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    throw notFound("Organization not found");
  }

  return membership;
}

export async function requireMembership(
  userId: string,
  organizationId: string,
  permission?: OrgPermission,
) {
  const membership = await getMembership(userId, organizationId);

  if (permission) {
    assertOrgPermission(membership.role, permission);
  }

  return membership;
}

export function taskVisibilityWhere(
  membership: Pick<OrganizationMembership, "role" | "userId" | "organizationId">,
) {
  if (membership.role !== "GUEST") {
    return {
      organizationId: membership.organizationId,
      deletedAt: null,
    };
  }

  return {
    organizationId: membership.organizationId,
    assigneeId: membership.userId,
    deletedAt: null,
  };
}
