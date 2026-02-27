import { usePrequizController } from "@/contexts/hooks/usePrequizController";
import { PostPreQuiz } from "@/components/quiz/PostPreQuiz";
import { addUserStatusFlag } from "@/core/authentication/UserStatusFlag";
import { UserStatusFlag } from "@/core/model/UserModel";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "../../../contexts/hooks/useUser";
import { usePrequiz } from "@/contexts/providers/CourseContextProvider";
import { CompletionStatus, CourseContent } from "@/core/model/OattsModel";
import { FlattenContents } from "@/utils/Flattener";
import { useStatuses } from "@/contexts/hooks/useStatus";

export const Route = createFileRoute("/_authenticated/onboarding/preQuizComplete")({
  component: RouteComponent,
});

function RouteComponent() {
  const [mayDisplay, setMayDisplay] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();
  const courses = usePrequiz();
  const allContent = useMemo(() => courses?.reduce((acc: CourseContent[], course) => [...acc, ...FlattenContents(course.contents)], []), [courses]);
  const statuses = useStatuses(allContent?.map(c => c.id) ?? []);
  const isComplete = useMemo(() => allContent?.every(c => statuses?.get(c.id)?.completionStatus === CompletionStatus.Completed) ?? false, [statuses]);

  useEffect(() => {
    if (user && isComplete) {
      addUserStatusFlag(user, UserStatusFlag.PreQuizzed).then(() => {
        setMayDisplay(true);
      });
    }
  }, [user, isComplete]);

  if (mayDisplay) {
    return <PostPreQuiz onNext={() => navigate({ to: "/dashboard" })}></PostPreQuiz>;
  } else {
    return <></>;
  }
}
