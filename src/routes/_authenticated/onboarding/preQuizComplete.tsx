import { usePrequizController } from "@/contexts/hooks/usePrequizController";
import { PostPreQuiz } from "@/components/quiz/PostPreQuiz";
import { addUserStatusFlag } from "@/core/authentication/UserStatusFlag";
import { UserStatusFlag } from "@/core/model/UserModel";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useUser } from "../../../contexts/hooks/useUser";

export const Route = createFileRoute("/_authenticated/onboarding/preQuizComplete")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const controller = usePrequizController();
  const { user } = useUser();
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (user && controller.checkIsComplete()) {
      addUserStatusFlag(user, UserStatusFlag.PreQuizzed).then(() => {
        setIsComplete(true);
      });
    }
  }, [user, controller.isLoading]);

  if (isComplete && !controller.isLoading) {
    return <PostPreQuiz onNext={() => navigate({ to: "/dashboard" })}></PostPreQuiz>;
  } else {
    return <></>;
  }
}
