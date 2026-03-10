import { QuizIntro } from "@/components/quiz/QuizIntro";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/onboarding/preQuizIntro")({
  component: RouteComponent,
});

function RouteComponent() {
  let navigate = useNavigate();

  return (
    <QuizIntro
      onNext={() => navigate({ to: "/onboarding/prequiz" })}
      onPrevious={() => navigate({ to: "/onboarding/interests" })}
    />
  );
}
