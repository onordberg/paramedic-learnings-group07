"use client";

import { useEffect, useRef } from "react";

interface StartMenuProps {
  onClose: () => void;
  onOpenMinesweeper: () => void;
}

export function StartMenu({ onClose, onOpenMinesweeper }: StartMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    // Defer so the click that opened the menu doesn't immediately close it
    const id = setTimeout(() => document.addEventListener("mousedown", handle), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handle);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        bottom: "29px",
        left: "0",
        zIndex: 500,
        background: "#c0c0c0",
        border: "2px solid",
        borderColor: "#ffffff #808080 #808080 #ffffff",
        minWidth: "180px",
        fontFamily: "'MS Sans Serif', Tahoma, Arial, sans-serif",
        fontSize: "11px",
        boxShadow: "none",
      }}
    >
      <MenuItem
        icon="/images/minesweeper/app-icon.svg"
        label="Minesweeper"
        onClick={() => { onOpenMinesweeper(); onClose(); }}
      />
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        width: "100%",
        padding: "5px 20px 5px 8px",
        background: "none",
        border: "none",
        cursor: "default",
        textAlign: "left",
        fontFamily: "'MS Sans Serif', Tahoma, Arial, sans-serif",
        fontSize: "11px",
        color: "#000000",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#000080";
        (e.currentTarget as HTMLElement).style.color = "#ffffff";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "none";
        (e.currentTarget as HTMLElement).style.color = "#000000";
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon} alt="" width={20} height={20} style={{ imageRendering: "pixelated", flexShrink: 0 }} />
      {label}
    </button>
  );
}
