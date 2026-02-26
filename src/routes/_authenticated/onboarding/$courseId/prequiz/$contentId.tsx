import CourseView from "@/components/module/CourseView";
import { getShortFileRoute } from "@/components/module/getFileRoute";
import OLD_CourseView from "@/components/module/old/OLD_CourseView";
import { usePrequizController } from "@/contexts/hooks/usePrequizController";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/onboarding/$courseId/prequiz/$contentId")({
  component: RouteComponent,
});

function RouteComponent() {
  const path = getShortFileRoute(controller.contentType); // TODO: Hardcode to preqiz.
  const FILE_ROUTE = getFileRoute(controller.contentType);;
  const { contentId } = useParams({ from: FILE_ROUTE });
  
  return <CourseView course={ } path="" />;
}
