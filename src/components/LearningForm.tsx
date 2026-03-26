"use client";

import { createLearning } from "@/app/actions";
import { useRef } from "react";

export function LearningForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await createLearning(formData);
    formRef.current?.reset();
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        Share a Learning
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Help your colleagues learn from your experience in the field.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="e.g. Tourniquet placement on difficult terrain"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            What did you learn?
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="Describe the situation, what you learned, and how it can help others..."
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium text-slate-700">
            Your name
          </label>
          <input
            id="author"
            name="author"
            type="text"
            required
            placeholder="e.g. Kari Nordmann"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Share Learning
        </button>
      </div>
    </form>
  );
}
