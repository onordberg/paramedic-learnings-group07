"use client";

export default function SourcesError() {
  return (
    <div style={{ maxWidth: "600px" }}>
      <div className="win-raised" style={{ overflow: "hidden" }}>
        <div className="win-titlebar" style={{ fontSize: "11px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div className="win-titlebar-btn" style={{ fontSize: "9px" }}>─</div>
            <span>Error</span>
          </div>
        </div>
        <div style={{ background: "#c0c0c0", padding: "16px" }}>
          <div className="win-sunken" style={{ background: "#ffffff", padding: "8px" }}>
            <p style={{ fontSize: "11px", color: "#800000", margin: 0 }}>
              ⚠ Could not load sources. Please try again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
