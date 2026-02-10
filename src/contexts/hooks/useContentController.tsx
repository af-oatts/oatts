import { CourseController } from "@/contexts/models/CourseController";
import { useParams } from "@tanstack/react-router";
import { useCourse } from "../providers/CourseContextProvider";
import { useCourseContentStates } from "./useCourseContentStates";

export function useContentController(): CourseController {
  const { courseId } = useParams({
    from: `/_authenticated/_authorized/courses/$courseId`,
  });
  const [course] = useCourse(courseId);
  const [states, statesIsLoading] = useCourseContentStates(course?.contents);

  return new CourseController({
    course,
    contents: course?.contents,
    contentType: "content",
    states,
    isLoading: statesIsLoading,
  });
}
