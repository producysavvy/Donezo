import { created, route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";
import { createComment } from "@/services/task.service";
import { createCommentSchema } from "@/validators/task";

type Params = {
  params: Promise<{ organizationId: string; taskId: string }>;
};

export function POST(request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId, taskId } = await params;
    const { user } = await requireCurrentSession();
    const input = createCommentSchema.parse(await request.json());
    return created(await createComment(user.id, organizationId, taskId, input));
  });
}
