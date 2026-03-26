import { getLearnings } from "./actions";
import { LearningCard } from "@/components/LearningCard";
import { LearningForm } from "@/components/LearningForm";

export default async function Home() {
  const allLearnings = await getLearnings();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Hero */}
      <section className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Learn from Every Call
        </h1>
        <p className="mt-3 text-lg text-slate-500">
          A shared knowledge base for ambulance personnel. Document what you
          learn in the field so the whole team can benefit.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Learnings feed */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Recent Learnings
          </h2>
          {allLearnings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
              <p className="text-slate-400">
                No learnings shared yet. Be the first!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allLearnings.map((learning) => (
                <LearningCard key={learning.id} learning={learning} />
              ))}
            </div>
          )}
        </section>

        {/* Sidebar with form */}
        <aside>
          <div className="sticky top-6">
            <LearningForm />
          </div>
        </aside>
      </div>
    </div>
  );
}
