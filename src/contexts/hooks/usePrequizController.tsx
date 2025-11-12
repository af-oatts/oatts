import { CourseController } from "@/contexts/models/CourseController";
import { usePrequizContents } from "../providers/CourseContextProvider";
import { useCourseContentStates } from "./useCourseContentStates";

export function usePrequizController() {
  const [course, contents, isLoading] = usePrequizContents();
  const [states, statesIsLoading] = useCourseContentStates(contents);

  return new CourseController({
    course,
    contents,
    contentType: "prequiz",
    states,
    isLoading: isLoading || statesIsLoading,
  });
}
