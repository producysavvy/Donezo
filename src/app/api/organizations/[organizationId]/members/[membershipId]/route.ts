import { noContent, ok, route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";
import {
  removeMember,
  updateMemberRole,
} from "@/services/organization.service";
import { updateMemberSchema } from "@/validators/organization";

type Params = {
  params: Promise<{ organizationId: string; membershipId: string }>;
};

export function PATCH(request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId, membershipId } = await params;
    const { user } = await requireCurrentSession();
    const input = updateMemberSchema.parse(await request.json());
    return ok(await updateMemberRole(user.id, organizationId, membershipId, input));
  });
}

export function DELETE(_request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId, membershipId } = await params;
    const { user } = await requireCurrentSession();
    await removeMember(user.id, organizationId, membershipId);
    return noContent();
  });
}
