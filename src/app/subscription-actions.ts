"use server";

import { db } from "@/db";
import { subscriptions, notifications } from "@/db/schema";
import { and, eq, isNull, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SubscribeSchema = z.object({
  topicId: z.string().uuid("Invalid topic"),
  email: z.string().email("Enter a valid email address"),
});

export type SubscribeState = {
  error?: string;
  success?: boolean;
  email?: string;
};

export async function subscribeTopic(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const result = SubscribeSchema.safeParse({
    topicId: formData.get("topicId"),
    email: formData.get("email"),
  });
  if (!result.success) return { error: result.error.issues[0].message };

  const { topicId, email } = result.data;

  await db
    .insert(subscriptions)
    .values({ topicId, email })
    .onConflictDoNothing();

  revalidatePath(`/topics/${topicId}`);
  return { success: true, email };
}

export async function getSubscriberCount(topicId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(subscriptions)
    .where(eq(subscriptions.topicId, topicId));
  return row?.n ?? 0;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(notifications)
    .where(isNull(notifications.readAt));
  return row?.n ?? 0;
}

// NOTE: marks ALL notifications read globally — no per-user read state (intentional course-project simplification).
export async function markAllNotificationsRead(): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(isNull(notifications.readAt));
  revalidatePath("/", "layout");
  revalidatePath("/notifications");
}

/** Called from updateTopic only when guidance content changes. */
export async function createTopicNotification(
  topicId: string,
  topicTitle: string,
): Promise<void> {
  await db.insert(notifications).values({
    topicId,
    message: `Guidance updated: "${topicTitle}"`,
  });
  revalidatePath("/", "layout");
}
