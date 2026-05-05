import { db } from "@/db";
import { notifications, topics } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { markAllNotificationsRead } from "@/app/subscription-actions";
import { MarkAllReadButton } from "./MarkAllReadButton";

export default async function NotificationsPage() {
  const rows = await db
    .select({
      id: notifications.id,
      message: notifications.message,
      readAt: notifications.readAt,
      createdAt: notifications.createdAt,
      topicId: notifications.topicId,
      topicTitle: topics.title,
    })
    .from(notifications)
    .innerJoin(topics, eq(notifications.topicId, topics.id))
    .orderBy(desc(notifications.createdAt));

  const unreadCount = rows.filter((r) => !r.readAt).length;

  return (
    <div style={{ maxWidth: "700px" }}>
      <div className="win-raised" style={{ overflow: "hidden" }}>
        <div className="win-titlebar">
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div className="win-titlebar-btn" style={{ fontSize: "9px" }}>─</div>
            <span>Notifications</span>
          </div>
          <div style={{ display: "flex", gap: "2px" }}>
            <div className="win-titlebar-btn">▼</div>
            <div className="win-titlebar-btn">▲</div>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{
          background: "#c0c0c0",
          borderBottom: "1px solid #808080",
          padding: "4px 6px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <Link href="/" className="win-btn win-btn-sm">← Back</Link>
          {unreadCount > 0 && (
            <MarkAllReadButton action={markAllNotificationsRead} />
          )}
          <span style={{ fontSize: "11px", color: "#404040", marginLeft: "4px" }}>
            {unreadCount > 0
              ? `${unreadCount} unread`
              : rows.length === 0
              ? "No notifications"
              : "All caught up"}
          </span>
        </div>

        {/* Content */}
        <div style={{ background: "#c0c0c0", padding: "8px" }}>
          {rows.length === 0 ? (
            <div className="win-sunken" style={{ background: "#ffffff", padding: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "11px", color: "#808080", margin: 0 }}>
                No notifications yet. Topics you subscribe to will appear here when updated.
              </p>
            </div>
          ) : (
            <div className="win-listview">
              {rows.map((n) => (
                <div
                  key={n.id}
                  className="win-listrow"
                  style={{
                    background: n.readAt ? "#e8e8e8" : "#ffffff",
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    padding: "4px 6px",
                  }}
                >
                  <span
                    style={{
                      color: n.readAt ? "#c0c0c0" : "#000080",
                      fontWeight: "bold",
                      minWidth: "10px",
                      fontSize: "11px",
                    }}
                  >
                    {n.readAt ? "" : "●"}
                  </span>
                  <div style={{ flex: 1 }}>
                    <Link
                      href={`/topics/${n.topicId}`}
                      style={{
                        fontSize: "11px",
                        fontWeight: n.readAt ? "normal" : "bold",
                        color: "#000080",
                      }}
                    >
                      {n.topicTitle}
                    </Link>
                    <span style={{ fontSize: "11px", color: "#404040", marginLeft: "6px" }}>
                      — {n.message}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#808080",
                      fontFamily: "monospace",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {n.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
