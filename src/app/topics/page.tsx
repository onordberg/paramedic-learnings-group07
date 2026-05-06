import { db } from "@/db";
import { topics, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { AREA_BADGE } from "@/app/_lib/area-badge";

export default async function TopicsPage() {
  const allTopics = await db
    .select({
      id: topics.id,
      title: topics.title,
      summary: topics.summary,
      area: topics.area,
      createdByName: users.name,
      createdAt: topics.createdAt,
    })
    .from(topics)
    .leftJoin(users, eq(topics.createdById, users.id))
    .orderBy(desc(topics.createdAt));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontWeight: "bold" }}>
          All Topics — {allTopics.length} {allTopics.length === 1 ? "item" : "items"}
        </span>
        <Link href="/topics/new" className="win-btn win-btn-sm">
          New Topic
        </Link>
      </div>

      <div className="win-listview">
        <div
          className="win-raised"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 80px 100px 90px",
            padding: "2px 6px",
            background: "#c0c0c0",
            fontWeight: "bold",
            borderBottom: "1px solid #808080",
          }}
        >
          <span>Title / Summary</span>
          <span>Area</span>
          <span>Created by</span>
          <span>Date</span>
        </div>

        {allTopics.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#808080" }}>
            No topics have been created yet.{" "}
            <Link href="/topics/new" style={{ color: "#000080" }}>Create one →</Link>
          </div>
        ) : (
          allTopics.map((topic) => (
            <div
              key={topic.id}
              className="win-listrow"
              style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 90px", gap: "4px" }}
            >
              <div>
                <div style={{ fontWeight: "bold" }}>{topic.title}</div>
                <div style={{ color: "#404040", marginTop: "1px" }}>{topic.summary}</div>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "10px",
                    padding: "1px 4px",
                    display: "inline-block",
                    ...AREA_BADGE[topic.area],
                  }}
                >
                  {topic.area}
                </span>
              </div>
              <div style={{ color: "#404040" }}>{topic.createdByName ?? "Unknown"}</div>
              <div style={{ color: "#404040", fontFamily: "monospace" }}>
                {new Date(topic.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
