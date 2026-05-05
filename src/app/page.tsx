import { db } from "@/db";
import { topics, topicAreaEnum } from "@/db/schema";
import { desc, and, or, eq, ilike, SQL } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";
import { NewTopicForm } from "@/app/_components/NewTopicForm";
import { SearchAndFilter } from "@/app/_components/SearchAndFilter";
import { AREA_BADGE } from "@/app/_lib/area-badge";

type SearchParams = Promise<{ q?: string; area?: string }>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, area } = await searchParams;

  const conditions: SQL[] = [];

  if (q) {
    const pattern = `%${q}%`;
    conditions.push(
      or(
        ilike(topics.title, pattern),
        ilike(topics.summary, pattern),
        ilike(topics.guidance, pattern),
      ) as SQL,
    );
  }

  if (area && (topicAreaEnum.enumValues as readonly string[]).includes(area)) {
    conditions.push(
      eq(topics.area, area as (typeof topicAreaEnum.enumValues)[number]),
    );
  }

  const allTopics = await db
    .select({
      id: topics.id,
      title: topics.title,
      summary: topics.summary,
      area: topics.area,
      createdBy: topics.createdBy,
      updatedAt: topics.updatedAt,
    })
    .from(topics)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(topics.updatedAt));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "8px", alignItems: "start" }}>
      {/* Left panel: topic list */}
      <div>
        {/* Search & filter */}
        <div className="win-groupbox" style={{ marginTop: 0, marginBottom: "8px" }}>
          <span className="win-groupbox-title">Filter</span>
          <Suspense>
            <SearchAndFilter />
          </Suspense>
        </div>

        {/* Topic count header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: "bold" }}>Operational Topics</span>
          <span style={{ fontSize: "11px", color: "#808080" }}>
            {allTopics.length} {allTopics.length === 1 ? "item" : "items"}
          </span>
        </div>

        {/* List view */}
        <div className="win-listview" style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
          {/* Column headers */}
          <div
            className="win-raised"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 90px",
              padding: "2px 6px",
              background: "#c0c0c0",
              fontSize: "11px",
              fontWeight: "bold",
              borderBottom: "1px solid #808080",
            }}
          >
            <span>Title</span>
            <span>Area</span>
            <span>Updated</span>
          </div>

          {allTopics.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#808080" }}>
              {q || area ? "No matching topics found." : "No topics yet. Create one using the form."}
            </div>
          ) : (
            allTopics.map((topic) => {
              return (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.id}`}
                  className="win-listrow"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 90px",
                    gap: "4px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "11px" }}>{topic.title}</div>
                    <div style={{ fontSize: "11px", color: "#404040", marginTop: "1px" }}>
                      {topic.summary}
                    </div>
                    <div style={{ fontSize: "11px", color: "#808080" }}>— {topic.createdBy}</div>
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
                  <div style={{ fontSize: "11px", color: "#404040", fontFamily: "monospace" }}>
                    {topic.updatedAt.toISOString().slice(0, 10)}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel: create topic form */}
      <div>
        <NewTopicForm />
      </div>
    </div>
  );
}
