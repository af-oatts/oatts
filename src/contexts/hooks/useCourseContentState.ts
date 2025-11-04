import { useContext, useEffect, useMemo } from "react";
import { ContentStatesContext } from "../ContentStatesContext";
import { CompletionStatus, ContentState, Course, StatelessCourse } from "@/core/model/OattsModel";
import { externalizeContentState, resetUserAssessment, saveContentStateType } from "@/core/database/Content";
import { FlattenContents } from "@/core/modules/ModuleUtils";

// Hook for accessing a SINGLE content item
export function useCourseContentState(contentId: string) {
  const context = useContext(ContentStatesContext);
  if (!context) throw new Error("useCourseContentState must be used within ContentStatesProvider");

  // Trigger loading if not already loaded
  useEffect(() => {
    context.ensureContentStateLoaded(contentId);
  }, [contentId, context]);

  const states = context.states.get(contentId);
  const isLoading = context.loading.has(contentId);

  return {
    states,
    isLoading,
    updateStatus: (status: CompletionStatus) => context.updateContentStatus(contentId, status),
  };
}

// Hook for accessing multiple content items
export function useCourseContentStates(contentIds: string[]) {
  const context = useContext(ContentStatesContext);
  if (!context) throw new Error("useCourseContentStates must be used within ContentStatesProvider");
  console.log({ context });
  // Trigger loading for all IDs
  useEffect(() => {
    console.log("ensure contents laoded");
    contentIds.forEach((id) => context.ensureContentStateLoaded(id));
  }, [contentIds.join(","), context]);

  const states = useMemo(
    () => contentIds.map((id) => context.states.get(id)).filter((v): v is ContentState => v !== undefined),
    [context.states, contentIds.join(",")],
  );

  const isLoading = useMemo(
    () => contentIds.some((id) => context.loading.get(id) === "loading"),
    [context.loading, contentIds.join(",")],
  );

  return { states, isLoading };
}

export function useSetContentState() {
  const context = useContext(ContentStatesContext);
  if (!context) throw new Error("useSetContentState must be used within ContentStatesProvider");
  return async (contentId: string, state: ContentState, noDbWrite: boolean = false) => {
    context.setContentState(contentId, state);
    if (noDbWrite) {
      return;
    }
    if (!context._user) {
      console.error("Tried to update " + contentId + "'s score for user, but user is undefined!");
      return;
    }
    let externalizedState = externalizeContentState(state);
    await saveContentStateType(context._user, contentId, externalizedState);
  };
}

export function useResetCourse() {
  const context = useContext(ContentStatesContext);
  if (!context) throw new Error("useResetCourse must be used within ContentStatesProvider");
  return async (course: StatelessCourse, noDbWrite: boolean = false) => {
    if (!context._user) {
      console.error("Tried to reset course " + course.id + "'s score for user, but user is undefined!");
      return;
    }
    let flatCourse = FlattenContents(course.contents);
    for (let content of flatCourse) {
      context.removeContentState(content.id);
      if (!noDbWrite) {
        await resetUserAssessment(context._user, content.id);
      }
    }
  };
}

export function useCourseCompletionStatus(course: Course) {
  const context = useContext(ContentStatesContext);
  context?.ensureContentStateLoaded(course.id);
  if (!context) throw new Error("useCourseCompletionStatus must be used within ContentStatesProvider");
  // let flatcontent = FlattenContents(course?.contents || []);
  console.log({ contents: course?.contents });
  const state = context.states.get(course.id);
  if (state) {
    return state.completionStatus;
  }
  return CompletionStatus.Unknown; //flatcontent[0]?.state.completionStatus;
}

export function useCourseState(courseId: string) {
  const context = useContext(ContentStatesContext);
  context?.ensureContentStateLoaded(courseId);
  if (!context) throw new Error("useCourseCompletionStatus must be used within ContentStatesProvider");
  // let flatcontent = FlattenContents(course?.contents || []);
  // console.log({ contents: course?.contents });
  return context.states.get(courseId);
}
