import { createFileRoute, useNavigate } from "@tanstack/react-router";
import IntroPage from "@/components/onboarding/IntroPage";
import { useState } from "react";
import { AnimatePresence } from "motion/react";
import PreQuizPage, { PostPreQuiz, QuizIntro } from "@/components/quiz/PreQuiz";
import RolePage from "@/components/onboarding/RolePage";
export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingRoute,
});

function OnboardingRoute() {
  const [step, setStep] = useState<OnboardingStep>(OnboardingStep.Intro);
  let navigate = useNavigate();

  function nextStep() {
    if (step === OnboardingStep.PostPreQuiz) {
      navigate({ to: "/dashboard" });
      return;
    }
    setStep(Math.min(step + 1, OnboardingStep.PostPreQuiz));
  }

  function previousStep() {
    setStep(Math.max(step - 1, 0));
  }

  const components = {
    [OnboardingStep.Intro]: () => <IntroPage onNext={nextStep} />,
    [OnboardingStep.InterestSelection]: () => <RolePage onNext={nextStep} onPrevious={previousStep} />,
    [OnboardingStep.PreQuizIntro]: () => <QuizIntro onNext={nextStep} onPrevious={previousStep} />,
    [OnboardingStep.PreQuiz]: () => <PreQuizPage onNext={nextStep} />,
    [OnboardingStep.PostPreQuiz]: () => <PostPreQuiz onNext={nextStep}></PostPreQuiz>,
  };

  const CurrentComponent = components[step];
  return (
    <>
      <AnimatePresence>
        <CurrentComponent />
      </AnimatePresence>
    </>
  );
}

enum OnboardingStep {
  Intro = 0,
  InterestSelection = 1,
  PreQuizIntro = 2,
  PreQuiz = 3,
  PostPreQuiz = 4
}

