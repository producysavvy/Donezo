import { created, ok, route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";
import { createTask, listTasks } from "@/services/task.service";
import { createTaskSchema, taskQuerySchema } from "@/validators/task";

type Params = {
  params: Promise<{ organizationId: string }>;
};

export function GET(request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId } = await params;
    const { user } = await requireCurrentSession();
    const query = taskQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams.entries()),
    );
    return ok(await listTasks(user.id, organizationId, query));
  });
}

export function POST(request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId } = await params;
    const { user } = await requireCurrentSession();
    const input = createTaskSchema.parse(await request.json());
    return created(await createTask(user.id, organizationId, input));
  });
}
