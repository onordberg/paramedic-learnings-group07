"use server";

import { db } from "@/db";
import { subscriptions, notifications } from "@/db/schema";
import { eq, isNull, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { z } from "zod";

const SubscribeSchema = z.object({
  topicId: z.string().uuid("Invalid topic"),
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
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const result = SubscribeSchema.safeParse({
    topicId: formData.get("topicId"),
  });
  if (!result.success) return { error: result.error.issues[0].message };

  const { topicId } = result.data;
  const email = session.user.email;

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

export async function markAllNotificationsRead(): Promise<void> {
  const session = await auth();
  if (!session) return;

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(isNull(notifications.readAt));
  revalidatePath("/", "layout");
  revalidatePath("/notifications");
}

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
