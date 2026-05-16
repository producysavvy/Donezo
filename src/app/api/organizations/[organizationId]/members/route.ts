import { ok, route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";
import { listMembers } from "@/services/organization.service";

type Params = {
  params: Promise<{ organizationId: string }>;
};

export function GET(_request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId } = await params;
    const { user } = await requireCurrentSession();
    return ok(await listMembers(user.id, organizationId));
  });
}
