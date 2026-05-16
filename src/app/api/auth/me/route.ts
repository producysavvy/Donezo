import { ok, route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";

export function GET() {
  return route(async () => {
    const session = await requireCurrentSession();
    return ok(session.user);
  });
}
