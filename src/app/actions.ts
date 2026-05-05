"use server";

import { db } from "@/db";
import { topics, topicAreaEnum } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const CreateTopicSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  guidance: z.string().min(1, "Guidance is required"),
  rationale: z.string().optional(),
  area: z.enum(topicAreaEnum.enumValues),
  createdBy: z.string().min(1, "Your name is required"),
});

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
