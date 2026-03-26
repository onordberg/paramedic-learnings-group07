import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const learnings = pgTable("learnings", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  author: text("author").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Learning = typeof learnings.$inferSelect;
export type NewLearning = typeof learnings.$inferInsert;
