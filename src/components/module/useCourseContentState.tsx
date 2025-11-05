import { StatelessCourseContent, ContentState, CourseContent } from "@/core/model/OattsModel";
import { getCourseContentState } from "@/core/modules/ModuleLoader";
import { useUser } from "@/routes/_authenticated/_authorized/dashboard";
import { useState, useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import { useCourse, usePostquizContents, usePrequizContents } from "@/contexts/providers/CourseContextProvider";
import { CourseController } from "./CourseController";

export function useCourseContentState(
  content: StatelessCourseContent | undefined,
): [ContentState | undefined, boolean] {
  const { user } = useUser();
  const [state, setState] = useState<ContentState>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !content) return;
    getCourseContentState(user, content)
      .then((next) => setState(next))
      .finally(() => setIsLoading(false));
  }, [content, user]);

  return [state, isLoading];
}

export type ContentStateMap = Record<string, ContentState>;

export function useCourseContentStates(content: CourseContent[] | undefined): [ContentStateMap | undefined, boolean] {
  const { user } = useUser();
  const [states, setStates] = useState<ContentStateMap>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !content) return;
    Promise.all(content.map((x) => getCourseContentState(user, x)))
      .then((result) => {
        const next = result.reduce((acc, x) => Object.assign(acc, { [x.contentID]: x }), {} as ContentStateMap);
        setStates(next);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return [states, isLoading];
}

export function useContentController(): CourseController {
  const { courseId } = useParams({
    from: `/_authenticated/_authorized/courses/$courseId`,
  });
  const [course] = useCourse(courseId);
  const [states, statesIsLoading] = useCourseContentStates(course?.contents);

  return new CourseController({
    course,
    contents: course?.contents,
    states,
    isLoading: statesIsLoading,
  });
}

export function usePrequizController() {
  const [course, contents, isLoading] = usePrequizContents();
  const [states, statesIsLoading] = useCourseContentStates(contents);

  return new CourseController({
    course,
    contents,
    states,
    isLoading: isLoading || statesIsLoading,
  });
}

export function usePostquizController() {
  const [course, contents, isLoading] = usePostquizContents();
  const [states, statesIsLoading] = useCourseContentStates(contents);
  return new CourseController({
    course,
    contents,
    states,
    isLoading: isLoading || statesIsLoading,
  });
}
