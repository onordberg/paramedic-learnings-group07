import Link from "next/link";
import { getUnreadNotificationCount } from "@/app/subscription-actions";

export async function NotificationBadge() {
  const unread = await getUnreadNotificationCount();

  if (unread === 0) return null;

  return (
    <Link
      href="/notifications"
      className="win-status-panel"
      style={{
        background: "#000080",
        color: "#ffffff",
        textDecoration: "none",
        fontWeight: "bold",
      }}
    >
      ● {unread} update{unread !== 1 ? "s" : ""}
    </Link>
  );
}
