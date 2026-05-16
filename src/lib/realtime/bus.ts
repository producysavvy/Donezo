export type RealtimeEvent = {
  organizationId: string;
  type:
    | "task.updated"
    | "comment.created"
    | "activity.created"
    | "notification.created"
    | "typing";
  payload: unknown;
};

type Listener = (event: RealtimeEvent) => void;

class InProcessRealtimeBus {
  private readonly listeners = new Map<string, Set<Listener>>();

  publish(event: RealtimeEvent) {
    const listeners = this.listeners.get(event.organizationId);

    if (!listeners) {
      return;
    }

    for (const listener of listeners) {
      listener(event);
    }
  }

  subscribe(organizationId: string, listener: Listener) {
    const listeners = this.listeners.get(organizationId) ?? new Set<Listener>();
    listeners.add(listener);
    this.listeners.set(organizationId, listeners);

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(organizationId);
      }
    };
  }
}

const globalForRealtime = globalThis as unknown as {
  donezoRealtimeBus?: InProcessRealtimeBus;
};

export const realtimeBus =
  globalForRealtime.donezoRealtimeBus ?? new InProcessRealtimeBus();

if (!globalForRealtime.donezoRealtimeBus) {
  globalForRealtime.donezoRealtimeBus = realtimeBus;
}
