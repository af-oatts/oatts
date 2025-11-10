import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/onboarding/$courseId/prequiz/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Navigate to={"/onboarding/preQuizComplete"} />;
}
