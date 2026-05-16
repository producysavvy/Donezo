"use client";

import { Paperclip } from "lucide-react";
import type { TaskView } from "@/components/app/types";

type TaskModalAttachmentsProps = {
  task: TaskView;
};

export function TaskModalAttachments({ task }: TaskModalAttachmentsProps) {
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Attachments
      </h3>
      <div className="mt-3 space-y-2">
        {task.attachments.map((attachment) => (
          <a
            className="flex items-start gap-2 rounded border border-line p-3 text-sm hover:border-brand"
            href={attachment.previewUrl ?? "#"}
            key={attachment.id}
          >
            <Paperclip className="mt-0.5 shrink-0" size={16} />
            <span>
              <span className="block font-medium text-ink">{attachment.fileName}</span>
              <span className="block text-xs text-slate-500">
                {attachment.mimeType} / {formatBytes(attachment.sizeBytes)}
              </span>
            </span>
          </a>
        ))}
        {task.attachments.length === 0 ? (
          <p className="text-sm text-slate-500">No attachments.</p>
        ) : null}
      </div>
    </section>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
