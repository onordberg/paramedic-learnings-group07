import { z } from "zod";

export const CreateSourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  sourceType: z.enum(["debrief", "research", "guideline", "incident_report"], {
    error: "Source type is required",
  }),
  date: z.date().optional(),
  content: z.string().min(1, "Content is required"),
  metadata: z.string().optional(),
});
