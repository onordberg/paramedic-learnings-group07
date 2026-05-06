import { db } from "@/db";
import { sources, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SOURCE_TYPE_LABELS } from "@/app/_lib/source-type-labels";
import { SetClippyContext } from "@/app/_components/SetClippyContext";
import { buildPageContext } from "@/app/_lib/clippy-context";

export default async function SourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [row] = await db
    .select({
      id: sources.id,
      title: sources.title,
      sourceType: sources.sourceType,
      date: sources.date,
      content: sources.content,
      metadata: sources.metadata,
      createdAt: sources.createdAt,
      submittedByName: users.name,
    })
    .from(sources)
    .leftJoin(users, eq(sources.submittedById, users.id))
    .where(eq(sources.id, id))
    .limit(1);

  if (!row) notFound();

  return (
    <div style={{ maxWidth: "700px" }}>
      <SetClippyContext
        context={buildPageContext("source-detail", {
          title: row.title,
          sourceType: row.sourceType,
          content: row.content.slice(0, 400),
        })}
      />
      <div className="win-raised" style={{ overflow: "hidden" }}>
        <div className="win-titlebar">
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div className="win-titlebar-btn" style={{ fontSize: "9px" }}>─</div>
            <span>{row.title}</span>
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
          <Link href="/sources" className="win-btn win-btn-sm">
            ← Back
          </Link>
          <div className="win-separator" style={{ width: "1px", height: "20px", margin: "0 2px" }} />
          <span style={{
            fontSize: "10px",
            padding: "2px 6px",
            background: "#000080",
            color: "#ffffff",
            display: "inline-block",
          }}>
            {SOURCE_TYPE_LABELS[row.sourceType] ?? row.sourceType}
          </span>
        </div>

        <div style={{ background: "#c0c0c0", padding: "12px" }}>
          {/* Metadata */}
          <div className="win-sunken" style={{ background: "#ffffff", padding: "4px 8px", marginBottom: "10px" }}>
            <table style={{ fontSize: "11px", borderSpacing: "0 2px", width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ color: "#808080", paddingRight: "12px", whiteSpace: "nowrap" }}>Submitted by:</td>
                  <td>{row.submittedByName ?? "Unknown"}</td>
                  <td style={{ color: "#808080", paddingLeft: "16px", paddingRight: "12px", whiteSpace: "nowrap" }}>Submitted:</td>
                  <td style={{ fontFamily: "monospace" }}>{row.createdAt.toISOString().slice(0, 10)}</td>
                </tr>
                {row.date && (
                  <tr>
                    <td style={{ color: "#808080" }}>Event date:</td>
                    <td style={{ fontFamily: "monospace" }}>{row.date.toISOString().slice(0, 10)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Content */}
          <div className="win-groupbox" style={{ marginTop: 0, marginBottom: "8px" }}>
            <span className="win-groupbox-title">
              {row.sourceType === "research" ? "Summary" : "Content"}
            </span>
            <div className="win-sunken" style={{ background: "#ffffff", padding: "6px 8px" }}>
              <p style={{ fontSize: "11px", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                {row.content}
              </p>
            </div>
          </div>

          {/* Metadata (research / guideline) */}
          {row.metadata && (
            <div className="win-groupbox" style={{ marginBottom: "8px" }}>
              <span className="win-groupbox-title">Metadata</span>
              <div className="win-sunken" style={{ background: "#ffffff", padding: "6px 8px" }}>
                <p style={{ fontSize: "11px", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                  {row.metadata}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
