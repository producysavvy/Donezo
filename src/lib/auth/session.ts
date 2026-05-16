import { cookies, headers } from "next/headers";
import type { Session, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { unauthorized } from "@/lib/errors";
import { createOpaqueToken, hashToken } from "@/lib/auth/tokens";

export const sessionCookieName = "donezo_session";
const sessionTtlMs = 1000 * 60 * 60 * 24 * 14;

export type AuthUser = Pick<User, "id" | "email" | "name">;

export type CurrentSession = {
  user: AuthUser;
  session: Session;
};

export async function createSession(userId: string) {
  const token = createOpaqueToken();
  const tokenHash = hashToken(token);
  const requestHeaders = await headers();
  const session = await prisma.session.create({
    data: {
      tokenHash,
      userId,
      userAgent: requestHeaders.get("user-agent"),
      ipAddress: requestHeaders.get("x-forwarded-for"),
      expiresAt: new Date(Date.now() + sessionTtlMs),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: session.expiresAt,
  });

  return session;
}

export async function getCurrentSession(): Promise<CurrentSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  return {
    user: session.user,
    session,
  };
}

export async function requireCurrentSession() {
  const currentSession = await getCurrentSession();

  if (!currentSession) {
    throw unauthorized();
  }

  return currentSession;
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }

  cookieStore.delete(sessionCookieName);
}
