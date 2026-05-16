import { created, ok, route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";
import {
  createOrganization,
  listOrganizations,
} from "@/services/organization.service";
import { createOrganizationSchema } from "@/validators/organization";

export function GET() {
  return route(async () => {
    const { user } = await requireCurrentSession();
    return ok(await listOrganizations(user.id));
  });
}

export function POST(request: Request) {
  return route(async () => {
    const { user } = await requireCurrentSession();
    const input = createOrganizationSchema.parse(await request.json());
    return created(await createOrganization(user.id, input));
  });
}
