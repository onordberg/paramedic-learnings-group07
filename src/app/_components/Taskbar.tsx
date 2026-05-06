// src/app/_components/Taskbar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Taskbar() {
  const pathname = usePathname();
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const topicsActive =
    pathname === "/" ||
    pathname === "/topics" ||
    pathname.startsWith("/topics/");
  const notificationsActive = pathname === "/notifications";

  return (
    <div
      className="win-raised"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#c0c0c0",
        display: "flex",
        alignItems: "center",
        gap: "3px",
        padding: "2px 4px",
        zIndex: 50,
        borderBottom: "none",
        borderLeft: "none",
        borderRight: "none",
      }}
    >
      {/* Start button — decorative, no routing */}
      <button
        className="win-btn win-btn-sm"
        style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold" }}
        type="button"
      >
        <Image
          src="/images/windows-logo.webp"
          alt="Windows"
          width={20}
          height={20}
        />
        Start
      </button>

      {/* Separator */}
      <div
        style={{
          width: "1px",
          height: "20px",
          background: "#808080",
          borderRight: "1px solid #ffffff",
          margin: "0 2px",
          flexShrink: 0,
        }}
      />

      {/* Topics */}
      <Link
        href="/topics"
        className={topicsActive ? "win-btn win-btn-sm win-btn-active" : "win-btn win-btn-sm"}
        style={topicsActive ? { padding: "2px 8px" } : undefined}
      >
        Topics
      </Link>

      {/* Notifications */}
      <Link
        href="/notifications"
        className={
          notificationsActive
            ? "win-btn win-btn-sm win-btn-active"
            : "win-btn win-btn-sm"
        }
        style={notificationsActive ? { padding: "2px 8px" } : undefined}
      >
        Notifications
      </Link>

      {/* Clock */}
      <span
        className="win-status-panel"
        data-testid="taskbar-clock"
        style={{ marginLeft: "auto" }}
      >
        {clock}
      </span>
    </div>
  );
}
