"use client";

import { useClippy } from "./ClippyProvider";

export function ClippyButton() {
  const { isOpen, setIsOpen } = useClippy();
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      title="Toggle Clippy assistant"
      aria-label="Toggle Clippy assistant"
      aria-pressed={isOpen}
      style={{
        border: "1px solid",
        borderColor: isOpen
          ? "#808080 #ffffff #ffffff #808080"
          : "#ffffff #808080 #808080 #ffffff",
        background: isOpen ? "#b8b8b8" : "#c0c0c0",
        padding: "1px 6px",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: "11px",
        lineHeight: "1",
      }}
    >
      📎
    </button>
  );
}
