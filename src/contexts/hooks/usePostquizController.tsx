import { CourseController } from "@/contexts/models/CourseController";
import { usePostquizContents } from "../providers/CourseContextProvider";
import { useCourseContentStates } from "./useCourseContentStates";

export function usePostquizController() {
  const [course, contents, isLoading] = usePostquizContents();
  const [states, statesIsLoading] = useCourseContentStates(contents);

  return new CourseController({
    course,
    contents,
    contentType: "postquiz",
    states,
    isLoading: isLoading || statesIsLoading,
  });
}
