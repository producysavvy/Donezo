import { readFile } from "node:fs/promises";
import path from "node:path";
import { OrgRole } from "@prisma/client";
import { route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";
import { forbidden, notFound } from "@/lib/errors";
import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/lib/rbac";

type Params = {
  params: Promise<{ storageKey: string[] }>;
};

export function GET(_request: Request, { params }: Params) {
  return route(async () => {
    const { user } = await requireCurrentSession();
    const { storageKey } = await params;
    const key = storageKey.join("/");
    const attachment = await prisma.attachment.findUnique({
      where: { storageKey: key },
      include: {
        task: {
          select: {
            assigneeId: true,
          },
        },
      },
    });

    if (!attachment || attachment.deletedAt) {
      throw notFound("File not found");
    }

    const membership = await requireMembership(
      user.id,
      attachment.organizationId,
      "task:view",
    );

    if (membership.role === OrgRole.GUEST && attachment.task.assigneeId !== user.id) {
      throw forbidden();
    }

    const root = path.resolve(getEnv().LOCAL_UPLOAD_DIR);
    const filePath = path.resolve(root, key);

    if (!filePath.startsWith(root)) {
      throw notFound("File not found");
    }

    const bytes = await readFile(filePath);

    return new Response(bytes, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Disposition": `inline; filename="${attachment.fileName}"`,
      },
    });
  });
}
