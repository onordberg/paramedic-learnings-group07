"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTopic, type CreateTopicState } from "@/app/actions";
import { useRouter } from "next/navigation";
import { AREA_COLORS } from "@/app/_lib/area-badge";

const AREAS = ["Clinical", "Operational", "Safety", "Administrative"] as const;

const initialState: CreateTopicState = {};

const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "2px" };

export default function NewTopicPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createTopic, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // useEffect is needed here because Server Actions don't give direct imperative access
  // to the form DOM — watching state.success is the correct way to trigger navigation
  useEffect(() => {
    if (state.success) {
      router.push("/");
    }
  }, [state.success, router]);

  return (
    <div style={{ maxWidth: "600px" }}>
      <div className="win-raised" style={{ overflow: "hidden" }}>
        {/* Dialog title bar */}
        <div className="win-titlebar" style={{ fontSize: "11px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div className="win-titlebar-btn" style={{ fontSize: "9px" }}>─</div>
            <span>New Topic</span>
          </div>
        </div>

        {/* Dialog body */}
        <div style={{ background: "#c0c0c0", padding: "12px" }}>
          <form ref={formRef} action={formAction} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>

            <div style={fieldStyle}>
              <label htmlFor="area" className="win-label">Area:</label>
              <select
                id="area"
                name="area"
                required
                className="win-select"
                style={{ width: "200px" }}
              >
                <option value="">— Select area —</option>
                {AREAS.map((a) => (
                  <option key={a} value={a} style={{ background: AREA_COLORS[a], color: "#ffffff" }}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="win-separator" />

            <FormField label="Title:" name="title" placeholder="e.g. Airway management in cardiac arrest" />
            <FormField label="Summary:" name="summary" placeholder="A brief description of what this topic covers." rows={3} />
            <FormField label="Guidance:" name="guidance" placeholder="Write the full operational guidance here." rows={8} />
            <FormField label="Rationale:" name="rationale" hint="(optional)" placeholder="Why does this guidance exist?" rows={3} />

            <div className="win-separator" />

            <FormField label="Your name:" name="createdBy" placeholder="e.g. Anna Larsen" />

            {state.error && (
              <div className="win-sunken" style={{ padding: "4px 6px", background: "#ffffff" }}>
                <p style={{ color: "#800000", fontSize: "11px" }}>⚠ {state.error}</p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px", marginTop: "8px" }}>
              <button type="submit" disabled={isPending} className="win-btn win-btn-default">
                {isPending ? "Creating…" : "OK"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="win-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  placeholder,
  hint,
  rows,
}: {
  label: string;
  name: string;
  placeholder?: string;
  hint?: string;
  rows?: number;
}) {
  return (
    <div style={fieldStyle}>
      <label htmlFor={name} className="win-label">
        {label}
        {hint && <span style={{ color: "#808080", marginLeft: "4px" }}>{hint}</span>}
      </label>
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
