"use client";

import { Send } from "lucide-react";
import type { RefObject } from "react";
import type { TaskView } from "@/components/app/types";

type TaskModalCommentsProps = {
  task: TaskView;
  canComment: boolean;
  pending: boolean;
  message: string | null;
  formRef: RefObject<HTMLFormElement | null>;
  onAddComment: (formData: FormData) => void | Promise<void>;
};

export function TaskModalComments({
  task,
  canComment,
  pending,
  message,
  formRef,
  onAddComment,
}: TaskModalCommentsProps) {
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Comments
      </h3>
      <div className="mt-3 space-y-3">
        {task.comments.map((comment) => (
          <article className="rounded border border-line p-3" key={comment.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">{comment.author.name}</p>
              <time className="text-xs text-slate-500">
                {new Date(comment.createdAt).toLocaleString()}
              </time>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {comment.body}
            </p>
          </article>
        ))}
        {task.comments.length === 0 ? (
          <p className="text-sm text-slate-500">No comments yet.</p>
        ) : null}
      </div>
      {canComment ? (
        <form ref={formRef} action={onAddComment} className="mt-4 space-y-2">
          <textarea
            className="min-h-20 w-full rounded border border-line px-3 py-2 text-sm"
            name="body"
            placeholder="Add a comment"
            required
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded bg-brand px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Send size={16} />
            {pending ? "Adding" : "Add comment"}
          </button>
          {message ? <p className="text-sm text-red-600">{message}</p> : null}
        </form>
      ) : null}
    </section>
  );
}
