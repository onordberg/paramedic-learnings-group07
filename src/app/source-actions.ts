"use server";

import { db } from "@/db";
import { sources } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { CreateSourceSchema } from "@/app/_lib/create-source-schema";
import { auth } from "@/auth";

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
  if (!session) return { error: "Not authenticated" };

  const rawDate = formData.get("date") as string | null;
  const sourceType = formData.get("sourceType") as string | null;
  let parsedDate: Date | undefined;
  if (rawDate && sourceType === "debrief") {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return { error: "Invalid date" };
    parsedDate = d;
  }

  const result = CreateSourceSchema.safeParse({
    title: formData.get("title"),
    sourceType: formData.get("sourceType"),
    date: parsedDate,
    content: formData.get("content"),
    metadata: formData.get("metadata") || undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const [inserted] = await db
    .insert(sources)
    .values({ ...result.data, submittedById: session.user.id })
    .returning({ id: sources.id });

  if (!inserted) return { error: "Failed to create source" };

  revalidatePath("/sources");
  return { success: true, id: inserted.id };
}
