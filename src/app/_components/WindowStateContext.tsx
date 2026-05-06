"use client";

import { createContext, useContext, useState } from "react";

interface WindowState {
  isMinimized: boolean;
  minimize: () => void;
  restore: () => void;
}

const WindowStateContext = createContext<WindowState | null>(null);

export function WindowStateProvider({ children }: { children: React.ReactNode }) {
  const [isMinimized, setIsMinimized] = useState(false);
  return (
    <WindowStateContext.Provider
      value={{
        isMinimized,
        minimize: () => setIsMinimized(true),
        restore: () => setIsMinimized(false),
      }}
    >
      {children}
    </WindowStateContext.Provider>
  );
}

export function useWindowState(): WindowState {
  const ctx = useContext(WindowStateContext);
  if (!ctx) throw new Error("useWindowState must be used inside WindowStateProvider");
  return ctx;
}

export function MinimizeButton() {
  const { minimize } = useWindowState();
  return (
    <button
      type="button"
      className="win-titlebar-btn"
      style={{ fontSize: "9px" }}
      aria-label="Minimize"
      onClick={minimize}
    >
      ─
    </button>
  );
}

export function WindowBody({ children }: { children: React.ReactNode }) {
  const { isMinimized } = useWindowState();
  if (isMinimized) return null;
  return <>{children}</>;
}
