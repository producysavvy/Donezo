import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { getEnv } from "@/lib/env";
import type { FileInput, StorageAdapter, StoredFile } from "@/lib/storage/types";

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export class LocalStorageAdapter implements StorageAdapter {
  private readonly rootDir = path.resolve(getEnv().LOCAL_UPLOAD_DIR);

  async put(input: FileInput): Promise<StoredFile> {
    const storageKey = path.join(
      input.organizationId,
      input.taskId,
      `${nanoid()}-${safeFileName(input.fileName)}`,
    );
    const absolutePath = path.join(this.rootDir, storageKey);

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, input.bytes);

    return {
      storageKey: storageKey.replace(/\\/g, "/"),
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.bytes.byteLength,
      previewUrl: `/api/files/${storageKey.replace(/\\/g, "/")}`,
    };
  }

  async delete(storageKey: string): Promise<void> {
    const absolutePath = path.join(this.rootDir, storageKey);
    await rm(absolutePath, { force: true });
  }
}
