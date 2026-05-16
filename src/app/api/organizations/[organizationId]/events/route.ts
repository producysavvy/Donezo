import { requireCurrentSession } from "@/lib/auth/session";
import { route } from "@/lib/api/responses";
import { requireMembership } from "@/lib/rbac";
import { realtimeBus, type RealtimeEvent } from "@/lib/realtime/bus";

type Params = {
  params: Promise<{ organizationId: string }>;
};

function encodeEvent(event: RealtimeEvent | { type: "connected"; payload: unknown }) {
  return `event: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`;
}

export function GET(request: Request, { params }: Params) {
  return route(async () => {
    const { organizationId } = await params;
    const { user } = await requireCurrentSession();
    await requireMembership(user.id, organizationId, "task:view");

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            encodeEvent({
              type: "connected",
              payload: { organizationId, connectedAt: new Date().toISOString() },
            }),
          ),
        );

        const unsubscribe = realtimeBus.subscribe(organizationId, (event) => {
          controller.enqueue(encoder.encode(encodeEvent(event)));
        });

        const heartbeat = setInterval(() => {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        }, 25_000);

        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeat);
          unsubscribe();
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  });
}
