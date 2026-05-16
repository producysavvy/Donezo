import { ok, route } from "@/lib/api/responses";
import { unauthorized } from "@/lib/errors";
import { getEnv } from "@/lib/env";
import { createDueDateNotifications } from "@/services/due-date.service";

export function POST(request: Request) {
  return route(async () => {
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${getEnv().CRON_SECRET}`) {
      throw unauthorized("Invalid cron secret");
    }

    return ok(await createDueDateNotifications());
  });
}
