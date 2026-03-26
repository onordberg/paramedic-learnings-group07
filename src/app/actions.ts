"use server";

import { db } from "@/db";
import { learnings } from "@/db/schema";
import { createLearningSchema } from "@/lib/validations";
import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getLearnings() {
  return db.select().from(learnings).orderBy(desc(learnings.createdAt));
}

export async function createLearning(formData: FormData) {
  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    author: formData.get("author") as string,
  };

  const validated = createLearningSchema.parse(raw);

  await db.insert(learnings).values(validated);

  revalidatePath("/");
}
