import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { TransitionParams } from "../../theme/TransitionParams";
import { CompletionStatus, ContentState, Course, CourseContent } from "@/core/model/OattsModel";
import { useRouteContext } from "@tanstack/react-router";
import { UserStatusFlag } from "@/core/model/UserModel";
import { addUserStatusFlag } from "../../core/authentication/UserStatusFlag";
import { useMultiCompletionStatus } from "../../core/modules/hooks/useMultiCompletionStatus";
import ModuleViewer from "../module/ModuleViewer";
import { LoadPreQuizzes } from "@/core/modules/ModuleLoader";

export default function PreQuizPage({ onNext }: { onNext: () => void }) {
  let [quizzes, setQuizzes] = useState<CourseContent[] | undefined>(undefined);
  let [quizExists, setQuizExists] = useState<boolean | undefined>(undefined);
  let { user, oattsManifest } = useRouteContext({
    from: "/_authenticated",
    select: (ctx) => ({ user: ctx.authentication.user, oattsManifest: ctx.config }),
  });
  useEffect(() => {
    let mounted = true;
    if (user == undefined || oattsManifest == undefined || oattsManifest.prequizzes == undefined) {
      return;
    }
    LoadPreQuizzes(user, oattsManifest).then(prequizzes => {
      setQuizzes(prequizzes);
      setQuizExists(true);
    })
    return () => {
      mounted = false;
    }
  }, []);

  useEffect(() => {
    if (quizExists === false)
      onComplete();
  }, [quizExists])

  let quizCompletionStatus = useMultiCompletionStatus(quizzes);

  useEffect(() => {
    if (quizCompletionStatus === CompletionStatus.Completed) {
      onComplete();
    }
  }, [quizCompletionStatus]);

  if (quizzes === undefined) {
    return (
      <>
        <Box>Loading...</Box>
      </>
    );
  }

  if (!quizExists) {
    return (
      <>
        <Box>A Pre Quiz has not been assigned</Box>
      </>
    );
  }

  async function onComplete() {
    if (user === undefined) {
      return;
    }

    await addUserStatusFlag(user, UserStatusFlag.PreQuizzed);
    onNext();
  }

  return (
    <>
      <Box width="100%" height="100%">
        <ModuleViewer contents={quizzes}></ModuleViewer>
      </Box>
    </>
  );
}

export function QuizIntro({ onNext, onPrevious }: { onNext: () => void; onPrevious: () => void }) {
  return (
    <>
      <Box
        display="grid"
        gridTemplateColumns="50px 100px 1fr 100px 50px"
        gridTemplateRows="1fr auto auto"
        gap="50px 10px"
        width="100%"
        height="100%"
        sx={(theme) => ({ background: theme.palette.background.gradient, alignItems: "center" })}
      >
        <Box
          sx={{
            gridColumn: "1 / span 5",
            gridRow: "1",
          }}
        >
          <Box display="flex" gap="20px" flexDirection="column" justifyContent="center" alignItems="center">
            <Typography
              key="PreQuizBanner"
              component={motion.span}
              {...TransitionParams({ endOpacity: 0.8 })}
              variant="h1"
            >
              Pre Quiz
            </Typography>
            <Typography
              key="interestDescription"
              component={motion.span}
              {...TransitionParams({ delay: 0.25 })}
              variant="body1"
            >
              You will now take a pre-test to determine your current knowledge and studying experiences.
            </Typography>
          </Box>
        </Box>

        <Button sx={{ gridColumn: "2", gridRow: "2" }} onClick={onPrevious}>
          Prev
        </Button>
        <Button sx={{ gridColumn: "4", gridRow: "2" }} onClick={onNext}>
          Next
        </Button>
      </Box>
    </>
  );
}

export function PostPreQuiz({ onNext }: { onNext: () => void }) {
  let user = useRouteContext({ from: "/_authenticated", select: (ctx) => ctx.authentication.user });
  useEffect(() => {
    if (user === undefined) {
      console.warn("User not found on PostPreQuiz");
      return;
    }

    addUserStatusFlag(user, UserStatusFlag.Onboarded);
  });

  return (
    <>
      <Box
        display="grid"
        gridTemplateColumns="50px 100px 1fr 100px 50px"
        gridTemplateRows="1fr auto auto"
        gap="50px 10px"
        width="100%"
        height="100%"
        sx={(theme) => ({ background: theme.palette.background.gradient })}
      >
        <Box
          sx={{
            gridColumn: "1 / span 5",
            gridRow: "1",
          }}
        >
          <Box display="flex" gap="20px" flexDirection="column" justifyContent="center" alignItems="center">
            <Typography
              key="PreQuizBanner"
              component={motion.span}
              {...TransitionParams({ endOpacity: 0.8 })}
              variant="h1"
            >
              Pre Quiz
            </Typography>
            <Typography
              key="interestDescription"
              component={motion.span}
              {...TransitionParams({ delay: 0.25 })}
              variant="body1"
            >
              Thank you for completing the quiz. You may now proceed to the dashboard.
            </Typography>
          </Box>
        </Box>

        <Button sx={{ gridColumn: "3", gridRow: "2", columnSpan: "2" }} onClick={onNext}>
          Continue
        </Button>
      </Box>
    </>
  );
}
