import { getEnv } from "@/lib/env";
import { LocalStorageAdapter } from "@/lib/storage/local";
import type { StorageAdapter } from "@/lib/storage/types";

let adapter: StorageAdapter | null = null;

export function getStorageAdapter() {
  if (!adapter) {
    const env = getEnv();

    if (env.STORAGE_DRIVER === "local") {
      adapter = new LocalStorageAdapter();
    }
  }

  if (!adapter) {
    throw new Error("No storage adapter configured");
  }

  return adapter;
}
