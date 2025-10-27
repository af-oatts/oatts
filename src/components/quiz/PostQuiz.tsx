import { Box } from "@mui/material";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompletionStatus, OldModule } from "@/core/model/OattsModel";
import { GetCoursesWithState } from "../../core/modules/ModuleLoader";
import { addUserStatusFlag } from "../../core/authentication/UserStatusFlag";
import { UserStatusFlag } from "@/core/model/UserModel";
import ModuleViewer from "../module/ModuleViewer";
import { calculateCourseCompletionStatus } from "../../core/modules/ModuleUtils";

function usePostQuizModule() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, config } = useRouteContext({
    from: "/_authenticated",
    select: (ctx) => {
      return { user: ctx.authentication.user, config: ctx.config };
    },
  });
  const [module, setModule] = useState<OldModule>();

  useEffect(() => {
    let mounted = true;
    if (!user || !config) return;
    GetCoursesWithState(user, config)
      .then((modules) => {
        if (!mounted)
          return;

        setModule(modules[0]);
      })
      .finally(() => {
        if (!mounted)
          return;

        setIsLoading(false);
      });
    return () => {
      mounted = false;
    }
  }, [config]);

  return { user, module, isLoading };
}

export default function PostQuizPage({ onNext }: { onNext: () => void }) {
  const { user, module, isLoading } = usePostQuizModule();
  const navigate = useNavigate();

  useEffect(() => {
    if (!module) return;
    const completionStatus = calculateCourseCompletionStatus(module);
    const isComplete = completionStatus === CompletionStatus.Completed;
    const isLoadedAndNoModule = user && !isLoading && !module;
    const isPostQuizComplete = user && !isLoading && isComplete && module;
    if (isPostQuizComplete || isLoadedAndNoModule) {
      addUserStatusFlag(user, UserStatusFlag.PostQuizzed).then(() => {
        onNext();
      });
      navigate({ to: "/" });
    }
  }, [user, isLoading, module]);

  if (isLoading || module === undefined) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box width="100%" height="100%">
      <ModuleViewer contents={module.contents} />
    </Box>
  );
}
