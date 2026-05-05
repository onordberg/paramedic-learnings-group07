import { db } from "@/db";
import { topics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AREA_COLORS } from "@/app/_lib/area-badge";
import { getSubscriberCount } from "@/app/subscription-actions";
import { SubscribeForm } from "@/app/_components/SubscribeForm";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [[topic], subscriberCount] = await Promise.all([
    db.select().from(topics).where(eq(topics.id, id)).limit(1),
    getSubscriberCount(id),
  ]);

  if (!topic) notFound();

  const areaColor = AREA_COLORS[topic.area] ?? "#404040";

  return (
    <div style={{ maxWidth: "700px" }}>
      {/* Window chrome */}
      <div className="win-raised" style={{ overflow: "hidden" }}>
        <div className="win-titlebar">
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div className="win-titlebar-btn" style={{ fontSize: "9px" }}>─</div>
            <span>{topic.title}</span>
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
          <Link href="/" className="win-btn win-btn-sm">
            ← Back
          </Link>
          <div className="win-separator" style={{ width: "1px", height: "20px", margin: "0 2px" }} />
          <span
            style={{
              fontSize: "10px",
              padding: "2px 6px",
              background: areaColor,
              color: "#ffffff",
              display: "inline-block",
            }}
          >
            {topic.area}
          </span>
        </div>

        {/* Content */}
        <div style={{ background: "#c0c0c0", padding: "12px" }}>

          {/* Metadata */}
          <div className="win-sunken" style={{ background: "#ffffff", padding: "4px 8px", marginBottom: "10px" }}>
            <table style={{ fontSize: "11px", borderSpacing: "0 2px", width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ color: "#808080", paddingRight: "12px", whiteSpace: "nowrap" }}>Created by:</td>
                  <td>{topic.createdBy}</td>
                  <td style={{ color: "#808080", paddingLeft: "16px", paddingRight: "12px", whiteSpace: "nowrap" }}>Created:</td>
                  <td style={{ fontFamily: "monospace" }}>{topic.createdAt.toISOString().slice(0, 10)}</td>
                </tr>
                <tr>
                  <td style={{ color: "#808080" }}>Area:</td>
                  <td>{topic.area}</td>
                  <td style={{ color: "#808080", paddingLeft: "16px" }}>Updated:</td>
                  <td style={{ fontFamily: "monospace" }}>{topic.updatedAt.toISOString().slice(0, 10)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="win-groupbox" style={{ marginTop: 0, marginBottom: "8px" }}>
            <span className="win-groupbox-title">Summary</span>
            <p style={{ fontSize: "11px" }}>{topic.summary}</p>
          </div>

          {/* Guidance */}
          <div className="win-groupbox" style={{ marginBottom: "8px" }}>
            <span className="win-groupbox-title">Guidance</span>
            <div className="win-sunken" style={{ background: "#ffffff", padding: "6px 8px" }}>
              <p style={{ fontSize: "11px", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                {topic.guidance}
              </p>
            </div>
          </div>

          {/* Rationale (optional) */}
          {topic.rationale && (
            <div className="win-groupbox" style={{ marginBottom: "8px" }}>
              <span className="win-groupbox-title">Rationale</span>
              <div className="win-sunken" style={{ background: "#ffffff", padding: "6px 8px" }}>
                <p style={{ fontSize: "11px", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                  {topic.rationale}
                </p>
              </div>
            </div>
          )}

          {/* Subscribe (Story 7) */}
          <SubscribeForm topicId={topic.id} subscriberCount={subscriberCount} />
        </div>
      </div>
    </div>
  );
}
