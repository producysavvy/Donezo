import { OrgRole } from "@prisma/client";
import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().email(),
  role: z.enum([OrgRole.ADMIN, OrgRole.MEMBER, OrgRole.GUEST]),
});

export const updateMemberSchema = z.object({
  role: z.enum([OrgRole.ADMIN, OrgRole.MEMBER, OrgRole.GUEST]),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(32),
});
