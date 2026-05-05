import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const topicAreaEnum = pgEnum("topic_area", [
  "Clinical",
  "Operational",
  "Safety",
  "Administrative",
]);

export const topics = pgTable("topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  guidance: text("guidance").notNull(),
  rationale: text("rationale"),
  area: topicAreaEnum("area").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export type Topic = typeof topics.$inferSelect;
