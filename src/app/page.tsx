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
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-text">
          Operational Topics
        </h1>
        <span className="font-mono text-xs text-text-muted uppercase tracking-wide">
          [{allTopics.length}&nbsp;{allTopics.length === 1 ? "topic" : "topics"}]
        </span>
      </div>

      <Suspense>
        <SearchAndFilter />
      </Suspense>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="lg:col-span-7">
          {allTopics.length === 0 ? (
            <EmptyState hasFilters={!!(q || area)} />
          ) : (
            <ul className="flex flex-col gap-4">
              {allTopics.map((topic) => (
                <li key={topic.id}>
                  <TopicCard
                    topic={topic}
                    areaBadge={
                      AREA_BADGE[topic.area] ?? "bg-slate-100 text-text-muted"
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-6">
            <NewTopicForm />
          </div>
        </aside>
      </div>
    </div>
  );
}

type TopicSummary = {
  id: string;
  title: string;
  summary: string;
  area: string;
  createdBy: string;
  updatedAt: Date;
};

function TopicCard({
  topic,
  areaBadge,
}: {
  topic: TopicSummary;
  areaBadge: string;
}) {
  return (
    <Link
      href={`/topics/${topic.id}`}
      className="block bg-surface-raised border border-border border-l-4 border-l-primary rounded p-4 transition-shadow duration-150 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-text">{topic.title}</h3>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded flex-shrink-0 ${areaBadge}`}
        >
          {topic.area}
        </span>
      </div>
      <p className="mt-1 text-sm text-text-muted line-clamp-2">{topic.summary}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-text-muted uppercase tracking-wide">
          {topic.createdBy}
        </span>
        <span className="text-text-muted text-xs select-none">·</span>
        <span className="font-mono text-xs text-text-muted">
          {topic.updatedAt.toISOString().slice(0, 10)}
        </span>
      </div>
    </Link>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="border border-dashed border-border rounded p-10 text-center">
      <p className="font-mono text-sm text-text-muted uppercase tracking-wide">
        {hasFilters ? "No matching topics" : "No topics yet"}
      </p>
      <p className="mt-2 text-xs text-text-muted">
        {hasFilters
          ? "Try a different search term or clear the area filter."
          : "Create the first operational topic using the form."}
      </p>
    </div>
  );
}
