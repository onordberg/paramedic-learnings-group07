import { db } from "@/db";
import { topics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

const AREA_BADGE: Record<string, string> = {
  Clinical: "bg-primary-subtle text-primary",
  Operational: "bg-slate-100 text-text-muted",
  Safety: "bg-red-50 text-danger",
  Administrative: "bg-slate-100 border border-border text-text-muted",
};

export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [topic] = await db
    .select()
    .from(topics)
    .where(eq(topics.id, id))
    .limit(1);

  if (!topic) notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link
        href="/"
        className="text-xs text-primary hover:underline inline-flex items-center gap-1 mb-6"
      >
        ← All topics
      </Link>

      <div className="flex items-start justify-between gap-4 mb-3">
        <h1 className="text-3xl font-bold tracking-tight text-text leading-tight">
          {topic.title}
        </h1>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded mt-2 flex-shrink-0 ${AREA_BADGE[topic.area] ?? "bg-slate-100 text-text-muted"}`}
        >
          {topic.area}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
        <span className="text-xs text-text-muted uppercase tracking-wide">
          Owner: {topic.createdBy}
        </span>
        <span className="text-text-muted text-xs">·</span>
        <span className="font-mono text-xs text-text-muted">
          Updated {topic.updatedAt.toISOString().slice(0, 10)}
        </span>
        <span className="text-text-muted text-xs">·</span>
        <span className="font-mono text-xs text-text-muted">
          Created {topic.createdAt.toISOString().slice(0, 10)}
        </span>
      </div>

      <div className="mb-6">
        <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
          Summary
        </p>
        <p className="text-sm text-text leading-relaxed">{topic.summary}</p>
      </div>

      <hr className="border-border mb-6" />

      <div className={topic.rationale ? "mb-6" : ""}>
        <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
          Guidance
        </p>
        <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">
          {topic.guidance}
        </p>
      </div>

      {topic.rationale && (
        <>
          <hr className="border-border mb-6" />
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
              Rationale
            </p>
            <p className="text-sm text-text leading-relaxed whitespace-pre-wrap pl-3 border-l-2 border-primary">
              {topic.rationale}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
