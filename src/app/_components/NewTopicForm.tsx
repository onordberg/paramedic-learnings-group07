"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTopic, type CreateTopicState } from "@/app/actions";
import { AREA_COLORS } from "@/app/_lib/area-badge";

const AREAS = ["Clinical", "Operational", "Safety", "Administrative"] as const;

const initialState: CreateTopicState = {};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
};

export function NewTopicForm() {
  const [state, formAction, isPending] = useActionState(createTopic, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // useEffect is needed here because Server Actions don't give direct imperative access
  // to the form DOM — watching state.success is the correct way to trigger a reset
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <div className="win-groupbox" style={{ marginTop: 0 }}>
      <span className="win-groupbox-title">New Topic</span>

      <form ref={formRef} action={formAction} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

        <div style={fieldStyle}>
          <label htmlFor="area" className="win-label">Area:</label>
          <select id="area" name="area" required className="win-select">
            <option value="">Select area…</option>
            {AREAS.map((a) => (
              <option key={a} value={a} style={{ background: AREA_COLORS[a], color: "#ffffff" }}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <FormField label="Title:" name="title" placeholder="e.g. Airway Management" />
        <FormField label="Summary:" name="summary" placeholder="One-line description" />
        <FormField label="Guidance:" name="guidance" placeholder="Detailed operational guidance…" rows={5} />
        <FormField label="Rationale (optional):" name="rationale" placeholder="Why does this guidance exist?" rows={3} />

        {state.error && (
          <div className="win-sunken" style={{ padding: "4px 6px", background: "#ffffff" }}>
            <p style={{ color: "#800000", fontSize: "11px" }}>⚠ {state.error}</p>
          </div>
        )}

        {state.success && (
          <div className="win-sunken" style={{ padding: "4px 6px", background: "#ffffff" }}>
            <p style={{ color: "#008000", fontSize: "11px" }}>✓ Topic created successfully.</p>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px", marginTop: "4px" }}>
          <button type="submit" disabled={isPending} className="win-btn win-btn-default">
            {isPending ? "Creating…" : "OK"}
          </button>
        </div>
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
    <div style={fieldStyle}>
      <label htmlFor={name} className="win-label">{label}</label>
      {rows ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          placeholder={placeholder}
          className="win-input"
          style={{ resize: "none" }}
        />
      ) : (
        <input
          id={name}
          name={name}
          type="text"
          placeholder={placeholder}
          className="win-input"
        />
      )}
    </div>
  );
}
