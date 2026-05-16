export type StoredFile = {
  storageKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  previewUrl: string;
};

export type FileInput = {
  organizationId: string;
  taskId: string;
  fileName: string;
  mimeType: string;
  bytes: Buffer;
};

export type StorageAdapter = {
  put(input: FileInput): Promise<StoredFile>;
  delete(storageKey: string): Promise<void>;
};
