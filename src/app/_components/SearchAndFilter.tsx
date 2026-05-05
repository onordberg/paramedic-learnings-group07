"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useRef, useEffect } from "react";

const AREAS = ["Clinical", "Operational", "Safety", "Administrative"] as const;

export function SearchAndFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentArea = searchParams.get("area") ?? "";

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function pushParams(q: string, area: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (area) params.set("area", area);
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    });
  }

  function handleSearchChange(value: string) {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams(value, currentArea), 250);
  }

  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
        <label className="win-label" style={{ whiteSpace: "nowrap", marginBottom: 0 }}>
          Find:
        </label>
        <input
          type="search"
          value={inputValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by title or content…"
          className="win-input"
          style={{ flex: 1 }}
        />
      </div>

      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        <span className="win-label" style={{ alignSelf: "center", marginBottom: 0 }}>
          Area:
        </span>
        <button
          onClick={() => pushParams(inputValue, "")}
          className={`win-btn win-btn-sm${!currentArea ? " win-btn-active" : ""}`}
        >
          All
        </button>
        {AREAS.map((area) => (
          <button
            key={area}
            onClick={() => pushParams(inputValue, currentArea === area ? "" : area)}
            className={`win-btn win-btn-sm${currentArea === area ? " win-btn-active" : ""}`}
          >
            {area}
          </button>
        ))}
      </div>
    </div>
  );
}
