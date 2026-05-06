import { db } from "@/db";
import { sources, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { SOURCE_TYPE_LABELS } from "@/app/_lib/source-type-labels";

export default async function SourcesPage() {
  const allSources = await db
    .select({
      id: sources.id,
      title: sources.title,
      sourceType: sources.sourceType,
      date: sources.date,
      createdAt: sources.createdAt,
      submittedByName: users.name,
    })
    .from(sources)
    .leftJoin(users, eq(sources.submittedById, users.id))
    .orderBy(desc(sources.createdAt));

  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "11px", fontWeight: "bold" }}>Sources</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "#808080" }}>
            {allSources.length} {allSources.length === 1 ? "item" : "items"}
          </span>
          <Link href="/sources/new" className="win-btn win-btn-sm">
            + Submit Source
          </Link>
        </div>
      </div>

      <div className="win-listview">
        {/* Column headers */}
        <div
          className="win-raised"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 130px 100px 90px",
            padding: "2px 6px",
            background: "#c0c0c0",
            fontSize: "11px",
            fontWeight: "bold",
            borderBottom: "1px solid #808080",
          }}
        >
          <span>Title</span>
          <span>Type</span>
          <span>Submitted by</span>
          <span>Date</span>
        </div>

        {allSources.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#808080", fontSize: "11px" }}>
            No sources yet. Submit one using the button above.
          </div>
        ) : (
          allSources.map((source) => (
            <Link
              key={source.id}
              href={`/sources/${source.id}`}
              className="win-listrow"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 130px 100px 90px",
                gap: "4px",
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: "11px" }}>{source.title}</div>
              <div>
                <span style={{
                  fontSize: "10px",
                  padding: "1px 4px",
                  background: "#000080",
                  color: "#ffffff",
                  display: "inline-block",
                }}>
                  {SOURCE_TYPE_LABELS[source.sourceType] ?? source.sourceType}
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "#404040" }}>{source.submittedByName ?? "Unknown"}</div>
              <div style={{ fontSize: "11px", color: "#404040", fontFamily: "monospace" }}>
                {source.createdAt.toISOString().slice(0, 10)}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
