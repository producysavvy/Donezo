import { describe, expect, it } from "vitest";
import { hasOrgPermission, taskVisibilityWhere } from "@/lib/rbac";

describe("rbac", () => {
  it("allows only owners to delete projects", () => {
    expect(hasOrgPermission("OWNER", "project:delete")).toBe(true);
    expect(hasOrgPermission("ADMIN", "project:delete")).toBe(false);
    expect(hasOrgPermission("MEMBER", "project:delete")).toBe(false);
    expect(hasOrgPermission("GUEST", "project:delete")).toBe(false);
  });

  it("allows members to create and update tasks", () => {
    expect(hasOrgPermission("OWNER", "task:create")).toBe(true);
    expect(hasOrgPermission("ADMIN", "task:update")).toBe(true);
    expect(hasOrgPermission("MEMBER", "task:update")).toBe(true);
    expect(hasOrgPermission("GUEST", "task:update")).toBe(false);
  });

  it("scopes guest visibility to assigned tasks", () => {
    expect(
      taskVisibilityWhere({
        role: "GUEST",
        userId: "user_1",
        organizationId: "org_1",
      }),
    ).toEqual({
      organizationId: "org_1",
      assigneeId: "user_1",
      deletedAt: null,
    });
  });
});
