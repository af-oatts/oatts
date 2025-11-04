import { ContentState, CompletionStatus } from "@/core/model/OattsModel";

export function getFirstIncompleteContentId(states: ContentState[]): string | undefined {
  const incomplete = states.find((c) => c.completionStatus !== CompletionStatus.Completed);
  return incomplete?.contentID;
}
