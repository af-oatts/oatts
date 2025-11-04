import { useCourse } from "@/contexts/hooks/useCourse";
import { createFileRoute, Navigate, useParams } from "@tanstack/react-router";
import { useCourseContentStates } from "@/contexts/hooks/useCourseContentState";
import { getFirstIncompleteContentId } from "@/components/module/getFirstIncompleteContentId";

export const Route = createFileRoute("/_authenticated/_authorized/courses/$courseId/content/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { courseId } = useParams({ from: "/_authenticated/_authorized/courses/$courseId/content/" });
  const course = useCourse(courseId);
  const contentIds = (course?.contents || []).map((x) => x.id);
  const { states, isLoading } = useCourseContentStates(contentIds);

  if (isLoading) return <></>;

  const contentId = getFirstIncompleteContentId(states) ?? (states[0]?.contentID || course?.contents[0].id);

  if (courseId && contentId) {
    return <Navigate to="/courses/$courseId/content/$contentId" params={{ courseId, contentId }} />;
  }

  return <></>;
}
