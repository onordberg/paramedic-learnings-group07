"use server";

import { db } from "@/db";
import { subscriptions, notifications, topics } from "@/db/schema";
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
  return { success: true };
}

export async function unsubscribeTopic(
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
    .delete(subscriptions)
    .where(and(eq(subscriptions.topicId, topicId), eq(subscriptions.email, email)));

  revalidatePath(`/topics/${topicId}`);
  return { success: true };
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

export async function markAllNotificationsRead(): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(isNull(notifications.readAt));
  revalidatePath("/", "layout");
}

/** Called from updateTopic when guidance changes. Creates one notification per update. */
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
