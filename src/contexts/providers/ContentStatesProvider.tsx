import { CompletionStatus, ContentState, createDefaultContentState } from "@/core/model/OattsModel";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { ContentStatesContext } from "../ContentStatesContext";
import User from "@/core/model/UserModel";
import { GetContentState } from "@/core/database/Content";
import { ScormModel } from "@/core/model/ScormModel";
import { useCoursesContext } from "./CourseContextProvider";
import { getCourseContentState } from "@/core/modules/ModuleLoader";

export type ContentLoadingState = "loaded" | "loading" | "unloaded";
type ContentStateRecord = {
  state: ContentState | undefined;
  loadingState: ContentLoadingState;
};
export function ContentStatesProvider({ children, user }: { children: React.ReactNode; user: User | undefined }) {
  const [states, setStates] = useState<Map<string, ContentState>>(new Map());
  const [loading, setLoading] = useState<Map<string, ContentLoadingState>>(new Map());
  const [courses, isCoursesLoading] = useCoursesContext();
  const updateContentStatus = useCallback((contentId: string, status: CompletionStatus) => {
    setStates((prev) => {
      const newMap = new Map(prev);
      const existingState = newMap.get(contentId);
      if (existingState) {
        newMap.set(contentId, { ...existingState, completionStatus: status });
      } else {
        newMap.set(contentId, { ...createDefaultContentState(contentId), completionStatus: status });
      }
      return newMap;
    });
  }, []);

  const setContentState = useCallback((contentID: string, state: ContentState) => {
    setStates((prev) => {
      const newMap = new Map(prev);
      newMap.set(contentID, state);
      return newMap;
    });
  }, []);

  useEffect(() => {
    // debugger;
    const toLoad = loading
      .entries()
      .toArray()
      .filter(([_, loadingState]) => !loadingState || loadingState == "unloaded");
    if (user) {
      const next = toLoad.reduce((acc, [id, _]) => acc.set(id, "loading"), loading);
      console.log({ toLoad: toLoad.map(([id, _]) => id) });
      setLoading(next);
      toLoad.map(([id, _]) => {
        console.log({ user, id });
        GetContentState(user, id).then((state) => {
          console.log({ user, id, state });
          // if (state) {
          // console.log({ state });
          const course = courses.find((x) => x.id == id);
          let scormState: ScormModel | undefined = undefined;
          // if (!course) throw Error("OOps");
          // getCourseContentState(user, course);

          if (state) {
            setStates((states) => states.set(id, state));
          } else {
          }
          setLoading((states) => states.set(id, "loaded"));
          // } else {
          //   setStates((states) => states.set(id, { state, loadingState: "loaded" }));
          // }
        });
      });
    }
  }, [states, loading]);
  // Non-async version that triggers loading in background
  const ensureContentStateLoaded = useCallback(
    (contentId: string) => {
      // If already loaded or loading, do nothing
      if (states.has(contentId)) {
        return;
      }

      if (!user) {
        console.error("Cannot fetch state for content ID " + contentId + ". User is undefined!");
        return;
      }
      const next = loading.set(contentId, "unloaded");
      console.log({ next });
      setLoading(next);
      // Mark as loading
      // setLoadingIds((prev) => new Set(prev).add(contentId));

      // // Load in background
      // GetContentState(user, contentId).then((state) => {
      //   if (state) {
      //     setContentState(contentId, state);
      //   }
      //   // Remove from loading set regardless of success/failure
      //   setLoadingIds((prev) => {
      //     const newSet = new Set(prev);
      //     newSet.delete(contentId);
      //     return newSet;
      //   });
      // });
    },
    [states, user],
  );

  const removeContentState = useCallback((contentId: string) => {
    setStates((prev) => {
      prev.delete(contentId);
      return prev;
    });
  }, []);

  const value = useMemo(
    () => ({
      _user: user,
      states,
      loading,
      updateContentStatus,
      ensureContentStateLoaded,
      setContentState,
      removeContentState,
    }),
    [states, updateContentStatus, ensureContentStateLoaded, setContentState],
  );

  return <ContentStatesContext.Provider value={value}>{children}</ContentStatesContext.Provider>;
}
