"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { StartMenu } from "@/app/_components/StartMenu";
import { Minesweeper } from "@/app/_components/Minesweeper";
import { useWindowState } from "@/app/_components/WindowStateContext";

function TaskbarButton({
  href,
  active,
  children,
  extraStyle,
  onBeforeNavigate,
  onClick,
}: {
  href?: string;
  active?: boolean;
  children: React.ReactNode;
  extraStyle?: React.CSSProperties;
  onBeforeNavigate?: () => void;
  onClick?: () => void;
}) {
  const className = active
    ? "win-btn win-btn-sm win-btn-active"
    : "win-btn win-btn-sm";
  // Padding locked on all taskbar buttons to prevent :active pseudo-class jitter
  const style: React.CSSProperties = { padding: "2px 8px", ...extraStyle };

  if (href) {
    return (
      <Link href={href} className={className} style={style} onClick={onBeforeNavigate}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className} style={style} onClick={onClick}>
      {children}
    </button>
  );
}

export function Taskbar() {
  const pathname = usePathname();
  const { isMinimized, minimize, restore } = useWindowState();
  const [clock, setClock] = useState("");
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [minesweeperOpen, setMinesweeperOpen] = useState(false);
  const [minesweeperMinimized, setMinesweeperMinimized] = useState(false);

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

  const closeStartMenu = useCallback(() => setStartMenuOpen(false), []);
  const openMinesweeper = useCallback(() => {
    setMinesweeperOpen(true);
    setMinesweeperMinimized(false);
  }, []);
  const closeMinesweeper = useCallback(() => setMinesweeperOpen(false), []);

  const topicsActive =
    !isMinimized &&
    (pathname === "/" ||
      pathname === "/topics" ||
      pathname.startsWith("/topics/"));
  const notificationsActive = !isMinimized && pathname === "/notifications";

  return (
    <>
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
      {/* Start button */}
      <div style={{ position: "relative" }}>
        <TaskbarButton
          active={startMenuOpen}
          extraStyle={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold" }}
          onClick={() => setStartMenuOpen((o) => !o)}
        >
          <Image src="/images/windows-logo.webp" alt="Windows" width={20} height={20} />
          Start
        </TaskbarButton>
        {startMenuOpen && (
          <StartMenu
            onClose={closeStartMenu}
            onOpenMinesweeper={openMinesweeper}
          />
        )}
      </div>

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

      {/* Pinned app button — reflects window state, toggles minimize/restore */}
      <TaskbarButton
        active={isMinimized}
        onClick={() => (isMinimized ? restore() : minimize())}
        extraStyle={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "bold" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/PARAME~1.SVG" alt="" width={20} height={20} style={{ imageRendering: "pixelated" }} />
        Paramedic Learnings
      </TaskbarButton>

      {minesweeperOpen && (
        <TaskbarButton
          active={!minesweeperMinimized}
          extraStyle={{ display: "flex", alignItems: "center", gap: "4px" }}
          onClick={() => setMinesweeperMinimized((m) => !m)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/minesweeper/app-icon.svg" alt="" width={16} height={16} style={{ imageRendering: "pixelated" }} />
          Minesweeper
        </TaskbarButton>
      )}

      <TaskbarButton href="/topics" active={topicsActive} onBeforeNavigate={restore}>
        Topics
      </TaskbarButton>

      <TaskbarButton
        href="/notifications"
        active={notificationsActive}
        extraStyle={{ display: "flex", alignItems: "center", gap: "4px" }}
        onBeforeNavigate={restore}
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

    {minesweeperOpen && !minesweeperMinimized && <Minesweeper onClose={closeMinesweeper} />}
    </>
  );
}
