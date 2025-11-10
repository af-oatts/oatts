import { useEffect, useState } from "react";
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
  const [status, setStatus] = useState<CompletionStatus>(CompletionStatus.Unknown);

  useEffect(() => {
    if (isCourseComplete(course, states || {})) setStatus(CompletionStatus.Completed);
    else if (isCourseStarted(course, states || {})) setStatus(CompletionStatus.Started);
    else setStatus(CompletionStatus.NotStarted);
  }, [course, states]);

  return [status, isLoading];
}
