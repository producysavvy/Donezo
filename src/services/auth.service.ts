import { InvitationStatus, OrgRole } from "@prisma/client";
import { addHours } from "@/services/date";
import { conflict, unauthorized } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { createOpaqueToken, hashToken } from "@/lib/auth/tokens";
import { slugify } from "@/lib/slug";
import { emailAdapter } from "@/lib/email";
import type {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/validators/auth";
import type { z } from "zod";

export async function signup(input: z.infer<typeof signupSchema>) {
  const email = normalizeEmail(input.email);
  const passwordHash = await hashPassword(input.password);

  const user = await prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({ where: { email } });

    if (existingUser) {
      throw conflict("Email is already registered");
    }

    const createdUser = await tx.user.create({
      data: {
        email,
        name: input.name,
        passwordHash,
      },
    });

    const organizationName = input.organizationName ?? `${input.name}'s Workspace`;

    await tx.organization.create({
      data: {
        name: organizationName,
        slug: slugify(organizationName),
        createdById: createdUser.id,
        memberships: {
          create: {
            userId: createdUser.id,
            role: OrgRole.OWNER,
          },
        },
      },
    });

    return createdUser;
  });

  await createSession(user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export async function login(input: z.infer<typeof loginSchema>) {
  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(input.email) },
  });

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw unauthorized("Invalid email or password");
  }

  await createSession(user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export async function requestPasswordReset(
  input: z.infer<typeof forgotPasswordSchema>,
) {
  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(input.email) },
  });

  if (!user) {
    return { sent: true };
  }

  const token = createOpaqueToken();

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: addHours(new Date(), 1),
    },
  });

  await emailAdapter.send({
    to: user.email,
    subject: "Reset your Donezo password",
    text: `Use this password reset token: ${token}`,
  });

  return { sent: true };
}

export async function resetPassword(input: z.infer<typeof resetPasswordSchema>) {
  const tokenHash = hashToken(input.token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
    throw unauthorized("Password reset token is invalid or expired");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: await hashPassword(input.password) },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.session.deleteMany({
      where: { userId: resetToken.userId },
    }),
  ]);

  return { reset: true };
}

export async function markInvitationAccepted(invitationId: string) {
  return prisma.invitation.update({
    where: { id: invitationId },
    data: {
      status: InvitationStatus.ACCEPTED,
      acceptedAt: new Date(),
    },
  });
}
