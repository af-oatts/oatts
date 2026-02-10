import { usePrequizController } from "@/contexts/hooks/usePrequizController";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/onboarding/preQuiz")({
  component: RouteComponent,
});

function RouteComponent() {
  const controller = usePrequizController();

  if (controller.isLoading) return <></>;
  

  return (
    <Navigate
      to={"/onboarding/$courseId/prequiz/$contentId"}
      params={{
        courseId: controller.course?.id || "",
        contentId: controller.getNext(),
      }}
    />
  );
}
