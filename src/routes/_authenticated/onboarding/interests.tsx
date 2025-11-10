import RolePage from "@/components/onboarding/RolePage";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/onboarding/interests")({
  component: RouteComponent,
});

function RouteComponent() {
  let navigate = useNavigate();

  return (
    <RolePage
      onNext={() => navigate({ to: "/onboarding/preQuizIntro" })}
      onPrevious={() => navigate({ to: "/onboarding/intro" })}
    />
  );
}
