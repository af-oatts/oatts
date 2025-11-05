import { createFileRoute, Navigate, useParams } from "@tanstack/react-router";
import { useContentController } from "@/components/module/useCourseContentState";

export const Route = createFileRoute("/_authenticated/_authorized/courses/$courseId/content/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { courseId } = useParams({ from: "/_authenticated/_authorized/courses/$courseId/content/" });
  const controller = useContentController();
  if (controller.isLoading) return <></>;

  const contentId = controller.getNext();

  if (courseId && contentId) {
    return <Navigate to="/courses/$courseId/content/$contentId" params={{ courseId, contentId }} />;
  }

  return <></>;
}
