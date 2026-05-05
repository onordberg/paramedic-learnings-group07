"use client";

import { useActionState } from "react";
import { subscribeTopic, type SubscribeState } from "@/app/subscription-actions";

const initial: SubscribeState = {};

export function SubscribeForm({
  topicId,
  subscriberCount,
}: {
  topicId: string;
  subscriberCount: number;
}) {
  const [state, formAction, isPending] = useActionState(subscribeTopic, initial);

  const displayCount = state.success ? subscriberCount + 1 : subscriberCount;

  return (
    <div className="win-groupbox" style={{ marginBottom: "8px" }}>
      <span className="win-groupbox-title">Subscriptions</span>

      <div style={{ fontSize: "11px", color: "#404040", marginBottom: "8px" }}>
        {displayCount} {displayCount === 1 ? "subscriber" : "subscribers"}
      </div>

      {!state.success ? (
        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <input type="hidden" name="topicId" value={topicId} />
          <div style={{ display: "flex", gap: "4px", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, maxWidth: "240px" }}>
              <label htmlFor="sub-email" className="win-label">
                Subscribe for updates:
              </label>
              <input
                id="sub-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="win-input"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="win-btn win-btn-sm"
              style={{ marginBottom: "2px" }}
            >
              {isPending ? "…" : "Subscribe"}
            </button>
          </div>
          {state.error && (
            <p style={{ fontSize: "11px", color: "#800000", margin: 0 }}>
              ⚠ {state.error}
            </p>
          )}
        </form>
      ) : (
        <div className="win-sunken" style={{ background: "#ffffff", padding: "4px 8px" }}>
          <span style={{ fontSize: "11px", color: "#008000" }}>
            ✓ Subscribed as {state.email ?? "you"}. You will be notified when this topic changes.
          </span>
        </div>
      )}
    </div>
  );
}
