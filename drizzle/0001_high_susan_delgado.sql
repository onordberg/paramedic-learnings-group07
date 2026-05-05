CREATE TYPE "public"."topic_area" AS ENUM('Clinical', 'Operational', 'Safety', 'Administrative');--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "rationale" text;--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "area" "topic_area" NOT NULL;