import { created, ok, route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";
import { createLabel, listLabels } from "@/services/label.service";
import { createLabelSchema } from "@/validators/label";

type Params = {
  params: Promise<{ organizationId: string }>;
};

export function GET(_request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId } = await params;
    const { user } = await requireCurrentSession();
    return ok(await listLabels(user.id, organizationId));
  });
}

export function POST(request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId } = await params;
    const { user } = await requireCurrentSession();
    const input = createLabelSchema.parse(await request.json());
    return created(await createLabel(user.id, organizationId, input));
  });
}
