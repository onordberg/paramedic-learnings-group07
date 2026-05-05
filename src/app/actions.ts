"use server";

import { db } from "@/db";
import { topics } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { CreateTopicSchema } from "@/app/_lib/create-topic-schema";

export type CreateTopicState = {
  error?: string;
  success?: boolean;
};

export async function createTopic(
  _prevState: CreateTopicState,
  formData: FormData
): Promise<CreateTopicState> {
  const result = CreateTopicSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    guidance: formData.get("guidance"),
    rationale: formData.get("rationale") || undefined,
    area: formData.get("area"),
    createdBy: formData.get("createdBy"),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  await db.insert(topics).values(result.data);
  revalidatePath("/");
  return { success: true };
}
