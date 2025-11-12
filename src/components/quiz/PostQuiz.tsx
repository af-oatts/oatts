import { Box } from "@mui/material";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { useMemo } from "react";
import { addUserStatusFlag } from "../../core/authentication/UserStatusFlag";
import { UserStatusFlag } from "@/core/model/UserModel";
// import CourseViewer from "../module/CourseViewer";
import { getFlattenedRoleSpecificQuizzes } from "@/core/utils/QuizUtils";

export default function PostQuizPage({ onNext }: { onNext: () => void }) {
  const navigate = useNavigate();
  const { user, config } = useRouteContext({
    from: "/_authenticated",
    select: (ctx) => {
      return { user: ctx.authentication.user, config: ctx.config };
    },
  });

  const quizzes = useMemo(() => {
    if (!config || !config.postquizzes) return [];
    return getFlattenedRoleSpecificQuizzes(config.postquizzes, config.roles);
  }, [config]);

  const onComplete = () => {
    if (!user) {
      console.error("Cannot mark user as postquizzed. User is undefined! (Honestly how did this even happen...)");
      navigate({ to: "/" });
      return;
    }

    addUserStatusFlag(user, UserStatusFlag.PostQuizzed).then(() => {
      onNext();
    });
    navigate({ to: "/" });
    return;
  };

  return (
    <Box width="100%" height="100%">
      {/* <CourseViewer contents={quizzes} onEverythingCompleted={onComplete} /> */}
    </Box>
  );
}
