import { describe, expect, it } from "vitest";
import { signupSchema } from "@/validators/auth";
import { createTaskSchema } from "@/validators/task";

describe("validators", () => {
  it("rejects weak signup passwords", () => {
    expect(() =>
      signupSchema.parse({
        name: "DC",
        email: "dc@example.com",
        password: "short",
      }),
    ).toThrow();
  });

  it("defaults task status and priority", () => {
    const task = createTaskSchema.parse({
      projectId: "project_123",
      title: "Ship baseline",
      labelIds: [],
    });

    expect(task.status).toBe("TODO");
    expect(task.priority).toBe("MEDIUM");
  });
});
