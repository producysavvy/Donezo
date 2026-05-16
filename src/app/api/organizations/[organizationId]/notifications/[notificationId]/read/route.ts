import { ok, route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";
import { markNotificationRead } from "@/services/notification.service";

type Params = {
  params: Promise<{ organizationId: string; notificationId: string }>;
};

export function PATCH(_request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId, notificationId } = await params;
    const { user } = await requireCurrentSession();
    return ok(await markNotificationRead(organizationId, user.id, notificationId));
  });
}
