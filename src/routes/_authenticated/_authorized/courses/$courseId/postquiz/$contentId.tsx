import OLD_CourseView from "@/components/module/OLD_CourseView";
import { usePostquizController } from "@/contexts/hooks/usePostquizController";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_authorized/courses/$courseId/postquiz/$contentId")({
  component: RouteComponent,
});

function RouteComponent() {
  const controller = usePostquizController();
  return <OLD_CourseView {...{ controller }} />;
}
