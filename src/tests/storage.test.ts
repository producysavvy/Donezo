import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LocalStorageAdapter } from "@/lib/storage/local";

let uploadDir: string;

describe("local storage adapter", () => {
  beforeEach(async () => {
    uploadDir = await mkdtemp(path.join(os.tmpdir(), "donezo-uploads-"));
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/test";
    process.env.SESSION_SECRET = "abcdefghijklmnopqrstuvwxyz123456";
    process.env.APP_URL = "http://localhost:3000";
    process.env.STORAGE_DRIVER = "local";
    process.env.LOCAL_UPLOAD_DIR = uploadDir;
    process.env.CRON_SECRET = "cron-secret-abcdefghijklmnopqrstuvwxyz";
  });

  afterEach(async () => {
    await rm(uploadDir, { recursive: true, force: true });
  });

  it("stores bytes and returns attachment metadata", async () => {
    const adapter = new LocalStorageAdapter();
    const stored = await adapter.put({
      organizationId: "org_123",
      taskId: "task_123",
      fileName: "brief.md",
      mimeType: "text/markdown",
      bytes: Buffer.from("hello"),
    });

    const bytes = await readFile(path.join(uploadDir, stored.storageKey));
    expect(bytes.toString("utf8")).toBe("hello");
    expect(stored.previewUrl).toContain("/api/files/");
  });
});
