import { Learning } from "@/db/schema";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function LearningCard({ learning }: { learning: Learning }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <h3 className="text-lg font-semibold text-slate-900">
        {learning.title}
      </h3>
      <p className="mt-2 text-slate-600 leading-relaxed whitespace-pre-line">
        {learning.description}
      </p>
      <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
        <span className="font-medium text-slate-500">{learning.author}</span>
        <span>&middot;</span>
        <time>{timeAgo(learning.createdAt)}</time>
      </div>
    </article>
  );
}
