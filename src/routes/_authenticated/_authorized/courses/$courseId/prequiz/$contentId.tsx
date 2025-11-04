import CourseView from "@/components/module/CourseView";
import { usePrequizController } from "@/components/module/useCourseContentState";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_authorized/courses/$courseId/prequiz/$contentId")({
  component: RouteComponent,
});

function RouteComponent() {
  const controller = usePrequizController();
  return <CourseView {...{ controller }} />;
}
