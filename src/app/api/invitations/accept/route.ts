import { ok, route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";
import { acceptInvitation } from "@/services/organization.service";
import { acceptInvitationSchema } from "@/validators/organization";

export function POST(request: Request) {
  return route(async () => {
    const { user } = await requireCurrentSession();
    const input = acceptInvitationSchema.parse(await request.json());
    return ok(await acceptInvitation(user.id, user.email, input));
  });
}
