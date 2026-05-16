import { ok, route } from "@/lib/api/responses";
import { requireCurrentSession } from "@/lib/auth/session";
import {
  listNotifications,
  markAllNotificationsRead,
} from "@/services/notification.service";
import { notificationQuerySchema } from "@/validators/notification";

type Params = {
  params: Promise<{ organizationId: string }>;
};

export function GET(request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId } = await params;
    const { user } = await requireCurrentSession();
    const query = notificationQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams.entries()),
    );
    return ok(await listNotifications(organizationId, user.id, query));
  });
}

export function PATCH(_request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId } = await params;
    const { user } = await requireCurrentSession();
    return ok(await markAllNotificationsRead(organizationId, user.id));
  });
}
