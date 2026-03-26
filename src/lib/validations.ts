import { z } from "zod";

export const createLearningSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
  author: z
    .string()
    .min(2, "Author name must be at least 2 characters")
    .max(100, "Author name must be less than 100 characters"),
});

export type CreateLearningInput = z.infer<typeof createLearningSchema>;
