"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";

const AREAS = ["Clinical", "Operational", "Safety", "Administrative"] as const;

export function SearchAndFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState(searchParams.get("q") ?? "");

  const currentArea = searchParams.get("area") ?? "";

  function pushParams(q: string, area: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (area) params.set("area", area);
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    });
  }

  return (
    <div className="mb-6">
      <input
        type="search"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          pushParams(e.target.value, currentArea);
        }}
        placeholder="Search topics by title or content…"
        className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-muted"
      />
      <div className="flex gap-2 mt-2 flex-wrap">
        <button
          onClick={() => pushParams(inputValue, "")}
          className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
            !currentArea
              ? "bg-primary text-white"
              : "border border-border text-text-muted hover:bg-surface"
          }`}
        >
          All
        </button>
        {AREAS.map((area) => (
          <button
            key={area}
            onClick={() =>
              pushParams(inputValue, currentArea === area ? "" : area)
            }
            className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
              currentArea === area
                ? "bg-primary text-white"
                : "border border-border text-text-muted hover:bg-surface"
            }`}
          >
            {area}
          </button>
        ))}
      </div>
    </div>
  );
}
