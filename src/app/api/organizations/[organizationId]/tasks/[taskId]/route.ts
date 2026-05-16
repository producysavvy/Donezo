import { noContent, ok, route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";
import { deleteTask, getTask, updateTask } from "@/services/task.service";
import { updateTaskSchema } from "@/validators/task";

type Params = {
  params: Promise<{ organizationId: string; taskId: string }>;
};

export function GET(_request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId, taskId } = await params;
    const { user } = await requireCurrentSession();
    return ok(await getTask(user.id, organizationId, taskId));
  });
}

export function PATCH(request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId, taskId } = await params;
    const { user } = await requireCurrentSession();
    const input = updateTaskSchema.parse(await request.json());
    return ok(await updateTask(user.id, organizationId, taskId, input));
  });
}

export function DELETE(_request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId, taskId } = await params;
    const { user } = await requireCurrentSession();
    await deleteTask(user.id, organizationId, taskId);
    return noContent();
  });
}
