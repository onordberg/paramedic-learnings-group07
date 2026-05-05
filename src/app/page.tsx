import { db } from "@/db";
import { topics } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NewTopicForm } from "@/app/_components/NewTopicForm";

export default async function Home() {
  const allTopics = await db
    .select({
      id: topics.id,
      title: topics.title,
      summary: topics.summary,
      createdBy: topics.createdBy,
      createdAt: topics.createdAt,
    })
    .from(topics)
    .orderBy(desc(topics.createdAt));

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">
          Operational Topics
        </h1>
        <span className="font-mono text-xs text-text-muted uppercase tracking-wide">
          [{allTopics.length}&nbsp;{allTopics.length === 1 ? "topic" : "topics"}]
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="lg:col-span-7">
          {allTopics.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="flex flex-col gap-4">
              {allTopics.map((topic) => (
                <li key={topic.id}>
                  <TopicCard topic={topic} />
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

type TopicSummary = Pick<
  typeof topics.$inferSelect,
  "id" | "title" | "summary" | "createdBy" | "createdAt"
>;

function TopicCard({ topic }: { topic: TopicSummary }) {
  return (
    <div className="bg-surface-raised border border-border border-l-4 border-l-primary rounded p-4 transition-shadow duration-150 hover:shadow-sm">
      <h3 className="text-base font-semibold text-text">{topic.title}</h3>
      <p className="mt-1 text-sm text-text-muted line-clamp-2">{topic.summary}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-text-muted uppercase tracking-wide">
          {topic.createdBy}
        </span>
        <span className="text-text-muted text-xs select-none">·</span>
        <span className="font-mono text-xs text-text-muted">
          {new Date(topic.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border rounded p-10 text-center">
      <p className="font-mono text-sm text-text-muted uppercase tracking-wide">
        No topics yet
      </p>
      <p className="mt-2 text-xs text-text-muted">
        Create the first operational topic using the form.
      </p>
    </div>
  );
}
