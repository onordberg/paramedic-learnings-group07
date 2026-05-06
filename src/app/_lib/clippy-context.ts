export type TopicData = {
  title: string;
  summary: string;
  guidance: string;
};

export function buildPageContext(page: string, topic?: TopicData): string {
  if (page === "topic-detail") {
    if (!topic) return "User is reading a topic.";
    return `User is reading the topic "${topic.title}". Summary: ${topic.summary}. Guidance: ${topic.guidance}`;
  }
  if (page === "topic-new") return "User is creating a new topic.";
  if (page === "topic-list") return "User is browsing the topic list.";
  return "User is on the Paramedic Learnings platform.";
}
