"use client";

import { useActionState } from "react";
import { register, type RegisterState } from "./actions";
import Link from "next/link";

const initial: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(register, initial);

  return (
    <div style={{ maxWidth: "320px", margin: "40px auto" }}>
      <div className="win-raised" style={{ overflow: "hidden" }}>
        <div className="win-titlebar">
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div className="win-titlebar-btn" style={{ fontSize: "9px" }}>─</div>
            <span>Create Account</span>
          </div>
        </div>

        <div style={{ padding: "12px", background: "#c0c0c0" }}>
          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <label htmlFor="name" className="win-label">Name:</label>
              <input id="name" name="name" type="text" required className="win-input" placeholder="Anna Larsen" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <label htmlFor="email" className="win-label">Email:</label>
              <input id="email" name="email" type="email" required className="win-input" placeholder="you@example.com" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <label htmlFor="password" className="win-label">Password:</label>
              <input id="password" name="password" type="password" required className="win-input" placeholder="8+ characters" />
            </div>

            {state.error && (
              <div className="win-sunken" style={{ padding: "4px 6px", background: "#ffffff" }}>
                <p style={{ color: "#800000", fontSize: "11px", margin: 0 }}>⚠ {state.error}</p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px", marginTop: "4px" }}>
              <button type="submit" disabled={isPending} className="win-btn win-btn-default">
                {isPending ? "Creating…" : "OK"}
              </button>
            </div>
          </form>

          <div style={{ marginTop: "8px", fontSize: "11px", textAlign: "center" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#000080" }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
