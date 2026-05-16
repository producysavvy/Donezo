import { created, route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";
import { inviteMember } from "@/services/organization.service";
import { inviteMemberSchema } from "@/validators/organization";

type Params = {
  params: Promise<{ organizationId: string }>;
};

export function POST(request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId } = await params;
    const { user } = await requireCurrentSession();
    const input = inviteMemberSchema.parse(await request.json());
    return created(await inviteMember(user.id, organizationId, input));
  });
}
