import { sourceTypeEnum } from "@/db/schema";
import { SOURCE_TYPE_LABELS } from "@/app/_lib/source-type-labels";

export type TopicData = {
  title: string;
  summary: string;
  guidance: string;
};

export type SourceData = {
  title: string;
  sourceType: (typeof sourceTypeEnum.enumValues)[number];
  content: string;
};

type PageKey =
  | "home"
  | "topic-detail"
  | "topic-new"
  | "topic-list"
  | "source-list"
  | "source-detail"
  | "source-new"
  | (string & {});

export function buildPageContext(page: PageKey, data?: TopicData | SourceData): string {
  if (page === "topic-detail") {
    if (!data || !("guidance" in data)) return "User is reading a topic.";
    return `User is reading the topic "${data.title}". Summary: ${data.summary}. Guidance: ${data.guidance}`;
  }
  if (page === "source-detail") {
    if (!data || !("sourceType" in data)) return "User is reading a source.";
    return `User is reading the source "${data.title}" (type: ${SOURCE_TYPE_LABELS[data.sourceType]}). Content: ${data.content}`;
  }
  if (page === "topic-new") return "User is creating a new topic.";
  if (page === "topic-list") return "User is browsing the topic list.";
  if (page === "source-list") return "User is browsing the sources list (debrief reports and research findings).";
  if (page === "source-new") return "User is submitting a new source — either a debrief report from an incident or a research/guideline finding.";
  if (page === "home") return "User is on the home page, browsing and searching operational topics.";
  return "User is on the Paramedic Learnings platform.";
}
