import CourseView from "@/components/module/CourseView";
import { usePrequizController } from "@/contexts/hooks/usePrequizController";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/onboarding/$courseId/prequiz/$contentId")({
  component: RouteComponent,
});

function RouteComponent() {
  const controller = usePrequizController();

  return <CourseView {...{ controller }} />;
}
