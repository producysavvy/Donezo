import { describe, expect, it } from "vitest";
import { hashToken } from "@/lib/auth/tokens";
import { normalizeEmail } from "@/lib/auth/password";

describe("auth helpers", () => {
  it("normalizes email addresses", () => {
    expect(normalizeEmail("  USER@Example.COM ")).toBe("user@example.com");
  });

  it("hashes tokens deterministically without storing raw values", () => {
    const first = hashToken("opaque-token");
    const second = hashToken("opaque-token");

    expect(first).toBe(second);
    expect(first).not.toBe("opaque-token");
    expect(first).toHaveLength(64);
  });
});
