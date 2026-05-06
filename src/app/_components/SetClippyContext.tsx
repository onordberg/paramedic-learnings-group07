"use client";

import { useEffect } from "react";
import { useClippy } from "./ClippyProvider";

export function SetClippyContext({ context }: { context: string }) {
  const { setPageContext } = useClippy();
  useEffect(() => {
    setPageContext(context);
    return () => setPageContext("User is on the Paramedic Learnings platform.");
  }, [context, setPageContext]);
  return null;
}
