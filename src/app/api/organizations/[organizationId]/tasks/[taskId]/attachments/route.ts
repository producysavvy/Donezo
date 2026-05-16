import { created, route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";
import { badRequest } from "@/lib/errors";
import { uploadAttachment } from "@/services/task.service";

type Params = {
  params: Promise<{ organizationId: string; taskId: string }>;
};

export function POST(request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId, taskId } = await params;
    const { user } = await requireCurrentSession();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw badRequest("Expected multipart form field named file");
    }

    return created(await uploadAttachment(user.id, organizationId, taskId, file));
  });
}
