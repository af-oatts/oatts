import { StatelessCourseContent, ContentState, Course, CourseContent } from "@/core/model/OattsModel";
import { getCourseContentState } from "@/core/modules/ModuleLoader";
import { useUser } from "@/routes/_authenticated/_authorized/dashboard";
import { useState, useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import { useCourse, usePostquizContents, usePrequizContents } from "@/contexts/providers/CourseContextProvider";
import { CompletionStatus } from "@/core/model/OattsModel";

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

type ContentStateMap = Record<string, ContentState>;

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

type ControllerReturnType = {
  course: Course | undefined;
  contents: CourseContent[] | undefined;
  states: ContentStateMap | undefined;
  isLoading: boolean;
};

export class CourseController implements ControllerReturnType {
  course: Course | undefined;
  contents: CourseContent[] | undefined;
  states: ContentStateMap | undefined;
  isLoading: boolean;

  constructor(data: ControllerReturnType) {
    this.course = data.course;
    this.contents = data.contents;
    this.states = data.states;
    this.isLoading = data.isLoading;
  }

  getContent(id: string) {
    return this.contents?.find((x) => x.id === id);
  }

  getState(id: string) {
    return this.states ? this.states[id] : undefined;
  }

  getNext() {
    const incomplete = this.contents?.find(
      (x) => this.states && this.states[x.id].completionStatus !== CompletionStatus.Completed,
    );
    return incomplete?.id || "";
  }
}
export function useContentController(): CourseController {
  const { courseId } = useParams({
    from: `/_authenticated/_authorized/courses/$courseId/content/$contentId`,
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
