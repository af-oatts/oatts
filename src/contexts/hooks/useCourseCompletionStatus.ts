import { CompletionStatus, Course } from "@/core/model/OattsModel";
import { ContentStateMap } from "@/contexts/models/ContentStateMap";
import { useCourseContentStates } from "./useCourseContentStates";

function isCourseComplete(course: Course, states: ContentStateMap) {
  return course.contents.every((x) => (states || {})[x.id]?.completionStatus === CompletionStatus.Completed);
}

function isCourseStarted(course: Course, states: ContentStateMap) {
  return course.contents.some((x) => {
    const status = (states || {})[x.id]?.completionStatus;
    return status !== CompletionStatus.NotStarted && status !== CompletionStatus.Unknown;
  });
}

export function useCourseCompletionStatus(course: Course): [CompletionStatus, boolean] {
  const [states, isLoading] = useCourseContentStates(course.contents);

  if (isLoading) return [CompletionStatus.Unknown, isLoading];
  else if (isCourseComplete(course, states || {})) return [CompletionStatus.Completed, isLoading];
  else if (isCourseStarted(course, states || {})) return [CompletionStatus.Started, isLoading];
  else return [CompletionStatus.NotStarted, isLoading];
}
