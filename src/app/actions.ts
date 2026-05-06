"use server";

import { db } from "@/db";
import { topics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CreateTopicSchema } from "@/app/_lib/create-topic-schema";
import { createTopicNotification } from "@/app/subscription-actions";
import { auth } from "@/auth";
import { z } from "zod";

export type CreateTopicState = {
  error?: string;
  success?: boolean;
};

export async function createTopic(
  _prevState: CreateTopicState,
  formData: FormData
): Promise<CreateTopicState> {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const result = CreateTopicSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    guidance: formData.get("guidance"),
    rationale: formData.get("rationale") || undefined,
    area: formData.get("area"),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  await db.insert(topics).values({
    ...result.data,
    createdById: session.user.id,
  });
  revalidatePath("/");
  return { success: true };
}

const UpdateTopicSchema = z.object({
  id: z.string().uuid("Invalid topic ID"),
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  guidance: z.string().min(1, "Guidance is required"),
  rationale: z.string().optional(),
});

export type UpdateTopicState = {
  error?: string;
  success?: boolean;
};

export async function updateTopic(
  _prevState: UpdateTopicState,
  formData: FormData
): Promise<UpdateTopicState> {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const result = UpdateTopicSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    guidance: formData.get("guidance"),
    rationale: formData.get("rationale") || undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { id, ...fields } = result.data;

  const [current] = await db
    .select({ guidance: topics.guidance })
    .from(topics)
    .where(eq(topics.id, id))
    .limit(1);

  await db.update(topics).set(fields).where(eq(topics.id, id));

  if (current && current.guidance !== fields.guidance) {
    await createTopicNotification(id, fields.title);
  }

  revalidatePath(`/topics/${id}`);
  revalidatePath("/");
  return { success: true };
}
