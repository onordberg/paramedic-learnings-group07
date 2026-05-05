"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTopic, type CreateTopicState } from "@/app/actions";

const AREAS = ["Clinical", "Operational", "Safety", "Administrative"] as const;

const initialState: CreateTopicState = {};

const fieldClass =
  "border border-border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-muted bg-surface-raised";

export function NewTopicForm() {
  const [state, formAction, isPending] = useActionState(createTopic, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <div className="bg-surface-raised border border-border rounded overflow-hidden">
      <div className="border-t-2 border-primary px-4 pt-4 pb-3 border-b border-b-border">
        <p className="text-xs text-text-muted uppercase tracking-wide font-mono">
          New Topic
        </p>
      </div>

      <form ref={formRef} action={formAction} className="px-4 py-4 flex flex-col gap-4">
        <FormField label="Title" name="title" placeholder="e.g. Airway Management" />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="area" className="text-xs text-text-muted uppercase tracking-wide">
            Area
          </label>
          <select id="area" name="area" required className={fieldClass}>
            <option value="">Select area…</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <FormField
          label="Summary"
          name="summary"
          placeholder="One-line description of this topic"
        />
        <FormField
          label="Guidance"
          name="guidance"
          placeholder="Detailed operational guidance for this topic…"
          rows={5}
        />
        <FormField
          label="Rationale (optional)"
          name="rationale"
          placeholder="Why does this guidance exist? Evidence or context."
          rows={3}
        />
        <FormField label="Your name" name="createdBy" placeholder="e.g. Anna Larsen" />

        {state.error && (
          <p className="text-xs text-danger bg-red-50 border border-red-200 rounded px-3 py-2">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="text-xs text-success bg-green-50 border border-green-200 rounded px-3 py-2">
            Topic created successfully.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Creating…" : "Create Topic"}
        </button>
      </form>
    </div>
  );
}

function FormField({
  label,
  name,
  placeholder,
  rows,
}: {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs text-text-muted uppercase tracking-wide">
        {label}
      </label>
      {rows ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          placeholder={placeholder}
          className={`${fieldClass} resize-none`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type="text"
          placeholder={placeholder}
          className={fieldClass}
        />
      )}
    </div>
  );
}
