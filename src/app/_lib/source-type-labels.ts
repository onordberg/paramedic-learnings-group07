import { sourceTypeEnum } from "@/db/schema";

export const SOURCE_TYPE_LABELS: Record<(typeof sourceTypeEnum.enumValues)[number], string> = {
  debrief: "Debrief Report",
  research: "Research Finding",
  guideline: "Guideline",
  incident_report: "Incident Report",
};
