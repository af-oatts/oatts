import IntroPage from "@/components/onboarding/IntroPage";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/onboarding/intro")({
  component: RouteComponent,
});

function RouteComponent() {
  let navigate = useNavigate();

  return <IntroPage onNext={() => navigate({ to: "/onboarding/interests" })} />;
}
