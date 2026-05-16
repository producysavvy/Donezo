import { noContent, route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";
import { deleteAttachment } from "@/services/task.service";

type Params = {
  params: Promise<{
    organizationId: string;
    taskId: string;
    attachmentId: string;
  }>;
};

export function DELETE(_request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId, taskId, attachmentId } = await params;
    const { user } = await requireCurrentSession();
    await deleteAttachment(user.id, organizationId, taskId, attachmentId);
    return noContent();
  });
}
