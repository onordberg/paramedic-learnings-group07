import { pgTable, uuid, text, timestamp, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";

export const topicAreaEnum = pgEnum("topic_area", [
  "Clinical",
  "Operational",
  "Safety",
  "Administrative",
]);

export const userRoleEnum = pgEnum("user_role", ["clinician", "approver"]);

export const sourceTypeEnum = pgEnum("source_type", [
  "debrief",
  "research",
  "guideline",
  "incident_report",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("clinician"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;

export const topics = pgTable("topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  guidance: text("guidance").notNull(),
  rationale: text("rationale"),
  area: topicAreaEnum("area").notNull().default("Operational"),
  createdById: uuid("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  sourceType: sourceTypeEnum("source_type").notNull(),
  date: timestamp("date", { withTimezone: true }),
  content: text("content").notNull(),
  metadata: text("metadata"),
  submittedById: uuid("submitted_by_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("subscriptions_topic_email_uidx").on(t.topicId, t.email)],
);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicId: uuid("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Topic = typeof topics.$inferSelect;
export type Source = typeof sources.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
