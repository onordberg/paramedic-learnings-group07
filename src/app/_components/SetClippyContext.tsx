"use client";

import { useEffect } from "react";
import { useClippy } from "./ClippyProvider";

export function SetClippyContext({ context }: { context: string }) {
  const { setPageContext } = useClippy();
  useEffect(() => {
    setPageContext(context);
  }, [context, setPageContext]);
  return null;
}
