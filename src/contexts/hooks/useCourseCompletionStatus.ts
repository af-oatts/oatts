
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { CompletionStatus, Course } from "@/core/model/OattsModel";
import { ContentStateMap } from "@/contexts/models/ContentStateMap";
import { useCourseContentStates } from "./useCourseContentStates";

function isCourseComplete(course: Course, states: ContentStateMap) {
  return course.contents.every((x) => (states || {})[x.id]?.completionStatus === CompletionStatus.Completed);
}

function isCourseStarted(course: Course, states: ContentStateMap) {
  return course.contents.some((x) => {
    const status = (states || {})[x.id]?.completionStatus;
    return status !== undefined && status !== CompletionStatus.NotStarted && status !== CompletionStatus.Unknown;
  });
}


// Culprit.
export function useCourseCompletionStatus(course: Course): [CompletionStatus, boolean] {
  const [states, isLoading] = useCourseContentStates(course.contents);
  console.log(states);
  

  if (isLoading) 
    return [CompletionStatus.Unknown, isLoading];
  if (isCourseComplete(course, states || {})) 
    return [CompletionStatus.Completed, isLoading];
  if (isCourseStarted(course, states || {})) 
    return [CompletionStatus.Started, isLoading];
  return [CompletionStatus.NotStarted, isLoading];
}
