"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login, type LoginState } from "./actions";
import Link from "next/link";

const initial: LoginState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [state, formAction, isPending] = useActionState(login, initial);

  return (
    <div style={{ maxWidth: "320px", margin: "40px auto" }}>
      <div className="win-raised" style={{ overflow: "hidden" }}>
        <div className="win-titlebar">
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div className="win-titlebar-btn" style={{ fontSize: "9px" }}>─</div>
            <span>Paramedic Learnings — Sign In</span>
          </div>
        </div>

        <div style={{ padding: "12px", background: "#c0c0c0" }}>
          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <label htmlFor="email" className="win-label">Email:</label>
              <input id="email" name="email" type="email" required autoFocus className="win-input" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <label htmlFor="password" className="win-label">Password:</label>
              <input id="password" name="password" type="password" required className="win-input" />
            </div>

            {state.error && (
              <div className="win-sunken" style={{ padding: "4px 6px", background: "#ffffff" }}>
                <p style={{ color: "#800000", fontSize: "11px", margin: 0 }}>⚠ {state.error}</p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px", marginTop: "4px" }}>
              <button type="submit" disabled={isPending} className="win-btn win-btn-default">
                {isPending ? "Signing in…" : "OK"}
              </button>
            </div>
          </form>

          <div style={{ marginTop: "8px", fontSize: "11px", textAlign: "center" }}>
            No account?{" "}
            <Link href="/register" style={{ color: "#000080" }}>Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
