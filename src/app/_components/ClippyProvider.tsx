"use client";

import React, { createContext, useContext, useState } from "react";

type ClippyContextValue = {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  pageContext: string;
  setPageContext: (v: string) => void;
};

const ClippyContext = createContext<ClippyContextValue | null>(null);

export function ClippyProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pageContext, setPageContext] = useState(
    "User is on the Paramedic Learnings platform."
  );

  return (
    <ClippyContext.Provider
      value={{ isOpen, setIsOpen, pageContext, setPageContext }}
    >
      {children}
    </ClippyContext.Provider>
  );
}

export function useClippy() {
  const ctx = useContext(ClippyContext);
  if (!ctx) throw new Error("useClippy must be used inside ClippyProvider");
  return ctx;
}
