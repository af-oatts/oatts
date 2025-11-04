import { createFileRoute } from "@tanstack/react-router";

import CourseView from "@/components/module/CourseView";
import { useContentController } from "@/components/module/useCourseContentState";

export const Route = createFileRoute("/_authenticated/_authorized/courses/$courseId/content/$contentId")({
  component: RouteComponent,
});

function RouteComponent() {
  const controller = useContentController();
  return <CourseView {...{ controller }} />;
}
