import type { CSSProperties } from "react";

export const AREA_COLORS: Record<string, string> = {
  Clinical: "#000080",
  Operational: "#808000",
  Safety: "#800000",
  Administrative: "#404040",
};

export const AREA_BADGE: Record<string, CSSProperties> = {
  Clinical: { background: "#000080", color: "#ffffff" },
  Operational: { background: "#808000", color: "#ffffff" },
  Safety: { background: "#800000", color: "#ffffff" },
  Administrative: { background: "#404040", color: "#ffffff" },
};
