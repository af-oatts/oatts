import { CourseController } from "@/contexts/models/CourseController";
import { usePrequizCourses } from "../providers/CourseContextProvider";
import { useCourseContentStates } from "./useCourseContentStates";
import { useMemo } from "react";
import { FlattenContents } from "@/core/modules/ModuleUtils";
import { FlattenCourse } from "@/utils/Flattener";
import { CourseContent } from "@/core/model/OattsModel";

export function usePrequizController() {
  const [courses, isLoading] = usePrequizCourses();
  const contents = useMemo(() => courses?.reduce<CourseContent[]>((acc: CourseContent[], course) => [...acc, ...FlattenCourse(course)], []), [courses]);
  const [states, statesIsLoading] = useCourseContentStates(contents);

  return new CourseController({
    course: courses![0], // PLEASE FOR THE LOVE OF EVERYTHING DELETE ME
    contents,
    contentType: "prequiz",
    states,
    isLoading: isLoading || statesIsLoading,
  });
}
