import { noContent, ok, route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";
import { deleteProject, updateProject } from "@/services/project.service";
import { updateProjectSchema } from "@/validators/project";

type Params = {
  params: Promise<{ organizationId: string; projectId: string }>;
};

export function PATCH(request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId, projectId } = await params;
    const { user } = await requireCurrentSession();
    const input = updateProjectSchema.parse(await request.json());
    return ok(await updateProject(user.id, organizationId, projectId, input));
  });
}

export function DELETE(_request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId, projectId } = await params;
    const { user } = await requireCurrentSession();
    await deleteProject(user.id, organizationId, projectId);
    return noContent();
  });
}
