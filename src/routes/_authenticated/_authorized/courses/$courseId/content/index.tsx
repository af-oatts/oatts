import { createFileRoute, Navigate, useParams } from "@tanstack/react-router";
import { useContentController } from "@/contexts/hooks/useContentController";

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

  const fallback = controller.course?.contents[0]?.id;
  if (fallback) {
    return <Navigate to="/courses/$courseId/content/$contentId" params={{ courseId, contentId: fallback }} />;
  }

  return <></>;
}
