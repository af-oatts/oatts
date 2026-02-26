import OLD_CourseView from "@/components/module/OLD_CourseView";
import { usePrequizController } from "@/contexts/hooks/usePrequizController";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/onboarding/$courseId/prequiz/$contentId")({
  component: RouteComponent,
});

function RouteComponent() {

  return <OLD_CourseView {...{ controller }} />;
}
