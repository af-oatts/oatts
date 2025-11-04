import CourseView from "@/components/module/CourseView";
import { usePostquizController } from "@/components/module/useCourseContentState";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_authorized/courses/$courseId/postquiz/$contentId")({
  component: RouteComponent,
});

function RouteComponent() {
  const controller = usePostquizController();
  return <CourseView {...{ controller }} />;
}
