"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { createSource, type CreateSourceState } from "@/app/source-actions";
import { useRouter } from "next/navigation";
import { FormError } from "@/app/_components/FormError";
import { sourceTypeEnum } from "@/db/schema";
import { SOURCE_TYPE_LABELS } from "@/app/_lib/source-type-labels";

const SOURCE_TYPES = sourceTypeEnum.enumValues;

const initialState: CreateSourceState = {};

const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "2px" };

export default function NewSourcePage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createSource, initialState);
  const [sourceType, setSourceType] = useState("");

  useEffect(() => {
    if (state.success && state.id) {
      router.push(`/sources/${state.id}`);
    }
  }, [state.success, state.id, router]);

  return (
    <div style={{ maxWidth: "600px" }}>
      <div className="win-raised" style={{ overflow: "hidden" }}>
        <div className="win-titlebar" style={{ fontSize: "11px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div className="win-titlebar-btn" style={{ fontSize: "9px" }}>─</div>
            <span>Submit Source</span>
          </div>
        </div>

        <div style={{ background: "#c0c0c0", padding: "12px" }}>
          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>

            <div style={fieldStyle}>
              <label htmlFor="sourceType" className="win-label">Type:</label>
              <select
                id="sourceType"
                name="sourceType"
                required
                className="win-select"
                style={{ width: "200px" }}
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
              >
                <option value="">— Select type —</option>
                {SOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>{SOURCE_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            <div className="win-separator" />

            <FormField label="Title:" name="title" placeholder="e.g. Post-incident debrief — CPR protocol deviation" />

            {sourceType === "debrief" && (
              <div style={fieldStyle}>
                <label htmlFor="date" className="win-label">Date:</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  className="win-input"
                  style={{ width: "160px" }}
                />
              </div>
            )}

            <FormField
              label={sourceType === "research" ? "Summary:" : "Content:"}
              name="content"
              placeholder={
                sourceType === "research"
                  ? "Summarise the key findings and conclusions."
                  : "Describe what happened, what was learned, and any recommended changes."
              }
              rows={8}
            />

            {sourceType === "research" && (
              <FormField
                label="Metadata:"
                name="metadata"
                hint="(optional)"
                placeholder="Author, journal, year, DOI, URL, etc."
                rows={3}
              />
            )}

            {state.error && <FormError message={state.error} />}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px", marginTop: "8px" }}>
              <button type="submit" disabled={isPending} className="win-btn win-btn-default">
                {isPending ? "Submitting…" : "OK"}
              </button>
              <button type="button" onClick={() => router.push("/sources")} className="win-btn">
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
