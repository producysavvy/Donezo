import { ok, route } from "@/lib/api/responses";
import { destroyCurrentSession } from "@/lib/auth/session";

export function POST() {
  return route(async () => {
    await destroyCurrentSession();
    return ok({ loggedOut: true });
  });
}
