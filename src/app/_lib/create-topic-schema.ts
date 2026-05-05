import { topicAreaEnum } from "@/db/schema";
import { z } from "zod";

export const CreateTopicSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  guidance: z.string().min(1, "Guidance is required"),
  rationale: z.string().optional(),
  area: z.enum(topicAreaEnum.enumValues),
  createdBy: z.string().min(1, "Your name is required"),
});
