import { ok, route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";
import { emitTyping } from "@/services/task.service";

type Params = {
  params: Promise<{ organizationId: string; taskId: string }>;
};

export function POST(_request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId, taskId } = await params;
    const { user } = await requireCurrentSession();
    return ok(await emitTyping(user.id, organizationId, taskId));
  });
}
