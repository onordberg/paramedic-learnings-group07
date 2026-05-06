"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function TaskbarButton({
  href,
  active,
  children,
  extraStyle,
}: {
  href?: string;
  active?: boolean;
  children: React.ReactNode;
  extraStyle?: React.CSSProperties;
}) {
  const className = active
    ? "win-btn win-btn-sm win-btn-active"
    : "win-btn win-btn-sm";
  // Padding locked on all taskbar buttons to prevent :active pseudo-class jitter
  const style: React.CSSProperties = { padding: "2px 8px", ...extraStyle };

  if (href) {
    return (
      <Link href={href} className={className} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className} style={style}>
      {children}
    </button>
  );
}

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
      <TaskbarButton extraStyle={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold" }}>
        <Image
          src="/images/windows-logo.webp"
          alt="Windows"
          width={20}
          height={20}
        />
        Start
      </TaskbarButton>

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

      <TaskbarButton href="/topics" active={topicsActive}>
        Topics
      </TaskbarButton>

      <TaskbarButton
        href="/notifications"
        active={notificationsActive}
        extraStyle={{ display: "flex", alignItems: "center", gap: "4px" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/bell-win311.svg" alt="" width={20} height={20} style={{ imageRendering: "pixelated" }} />
        Notifications
      </TaskbarButton>

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
