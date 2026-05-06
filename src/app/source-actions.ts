"use server";

import { db } from "@/db";
import { sources } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CreateSourceSchema } from "@/app/_lib/create-source-schema";
import { auth } from "@/auth";
import { summarizeSource } from "@/lib/summarize-source";

export type CreateSourceState = {
  error?: string;
  success?: boolean;
  id?: string;
};

export async function createSource(
  _prevState: CreateSourceState,
  formData: FormData
): Promise<CreateSourceState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const rawDate = formData.get("date") as string | null;
  const sourceType = formData.get("sourceType") as string | null;
  let parsedDate: Date | undefined;
  if (sourceType === "debrief") {
    if (!rawDate) return { error: "Date is required for debrief reports" };
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return { error: "Invalid date" };
    parsedDate = d;
  }

  const result = CreateSourceSchema.safeParse({
    title: formData.get("title"),
    sourceType,
    date: parsedDate,
    content: formData.get("content"),
    metadata: formData.get("metadata") || undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  let insertedId: string;
  try {
    const [inserted] = await db
      .insert(sources)
      .values({ ...result.data, submittedById: session.user.id })
      .returning({ id: sources.id });

    if (!inserted) return { error: "Failed to create source" };
    insertedId = inserted.id;
  } catch {
    return { error: "Database error — please try again." };
  }

  try {
    const { summary, modelId } = await summarizeSource({
      title: result.data.title,
      sourceType: result.data.sourceType,
      content: result.data.content,
      metadata: result.data.metadata ?? null,
    });
    await db
      .update(sources)
      .set({ summary, summaryModel: modelId })
      .where(eq(sources.id, insertedId));
  } catch (err) {
    console.error("[summarize-source] failed", { sourceId: insertedId, err });
    // Submission still succeeds; summary stays null.
  }

  revalidatePath("/sources");
  return { success: true, id: insertedId };
}
