import { created, ok, route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";
import { createProject, listProjects } from "@/services/project.service";
import { createProjectSchema } from "@/validators/project";

type Params = {
  params: Promise<{ organizationId: string }>;
};

export function GET(_request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId } = await params;
    const { user } = await requireCurrentSession();
    return ok(await listProjects(user.id, organizationId));
  });
}

export function POST(request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId } = await params;
    const { user } = await requireCurrentSession();
    const input = createProjectSchema.parse(await request.json());
    return created(await createProject(user.id, organizationId, input));
  });
}
