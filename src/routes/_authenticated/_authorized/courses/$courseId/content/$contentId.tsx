import { createFileRoute } from "@tanstack/react-router";

import OLD_CourseView from "@/components/module/old/OLD_CourseView";
import { useContentController } from "@/contexts/hooks/useContentController";

export const Route = createFileRoute("/_authenticated/_authorized/courses/$courseId/content/$contentId")({
  component: RouteComponent,
});

function RouteComponent() {
  const controller = useContentController();
  return <OLD_CourseView {...{ controller }} />;
}
