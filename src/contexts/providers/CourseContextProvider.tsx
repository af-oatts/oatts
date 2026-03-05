import { Course, CourseContent, Goal, OattsManifest } from "@/core/model/OattsModel";
import LoadConfig from "@/core/utils/ConfigLoader";
import { getFlattenedRoleSpecificQuizzes } from "@/core/utils/QuizUtils";
import { FlattenCourse } from "@/utils/Flattener";
import { createContext, useContext, useEffect, useState } from "react";

type ManifestContextType = {
  isLoading: boolean;
  config: OattsManifest;
};

const ManifestContext = createContext<ManifestContextType>(createDefaultManifest());

function createDefaultManifest() {
  return {
    config: {
      courses: [],
      roles: [],
      prequizzes: [],
      postquizzes: [],
    },
    isLoading: true,
  };
}

export function ManifestContextProvider({ children }: { children: React.ReactNode }) {
  const [manifestContext, setManifestContext] = useState<ManifestContextType>(createDefaultManifest());

  useEffect(() => {
    LoadConfig()
      .then((config) => {
        if (config)
          setManifestContext({
            ...manifestContext,
            config,
            isLoading: false,
          });
      })
      .catch(() => {
        setManifestContext((value) => ({ ...value, isLoading: false }));
      });
  }, []);

  return <ManifestContext.Provider value={manifestContext}>{children}</ManifestContext.Provider>;
}

export function useManifestContext() {
  return useContext(ManifestContext);
}

export function useCoursesContext(): [Course[], boolean] {
  const manifestContext = useManifestContext();

  return [manifestContext.config.courses, manifestContext.isLoading];
}

export function useCourse(courseId: string): [Course | undefined, boolean] {
  const manifestContext = useManifestContext();

  const course = manifestContext.config.courses.find((x) => x.id == courseId);

  return [course, manifestContext.isLoading];
}

export function useCourseContent(courseId: string, contentId: string): [CourseContent | undefined, boolean] {
  const manifestContext = useManifestContext();

  const course = manifestContext.config.courses.find((x) => x.id == courseId);

  const content = course ? course.contents.find((x) => x.id == contentId) : undefined;

  return [content, manifestContext.isLoading];
}


/// Null means prequizzes are decidedly empty. They do not exist. Undefined means it just hasn't loaded yet.
export function usePrequiz(): Course[] | undefined | null {
  const manifestContext = useManifestContext();
  const { config, isLoading } = manifestContext;
  if(isLoading) {
    return undefined;
  }
  const { prequizzes, roles } = config;
  const courses = prequizzes?.filter(prequiz => prequiz.roleIds.some(rid => roles.some(other => other.id === rid)));
  return courses ?? null;
}


/// Null means prequizzes are decidedly empty. They do not exist. Undefined means it just hasn't loaded yet.
export function usePostquiz(): Course[] | undefined | null {
  const manifestContext = useManifestContext();
  const { config, isLoading } = manifestContext;
  if(isLoading) {
    return undefined;
  }
  const { postquizzes, roles } = config;
  const courses = postquizzes?.filter(postquiz => postquiz.roleIds.some(rid => roles.some(other => other.id === rid)));
  return courses ?? null;
}








export function usePrequizCourses(): [Course[] | undefined, boolean] {
  const manifestContext = useManifestContext();
  const { config } = manifestContext;
  const { prequizzes, roles } = config;
  const tailored = prequizzes?.filter(prequiz => prequiz.roleIds.some(rid => roles.some(other => other.id === rid)));

  return [tailored, manifestContext.isLoading];
}

export function usePostquizContents(): [Course | undefined, CourseContent[] | undefined, boolean] {
  const manifestContext = useManifestContext();
  const { config } = manifestContext;
  const { postquizzes, roles } = config;
  const contents = getFlattenedRoleSpecificQuizzes(postquizzes || [], roles);

  return [(postquizzes || [])[0], contents, manifestContext.isLoading];
}

export function useGoals(): [Goal[] | undefined, boolean] {
  const manifestCtx = useManifestContext();
  return [manifestCtx.config.goals, manifestCtx.isLoading];

} 