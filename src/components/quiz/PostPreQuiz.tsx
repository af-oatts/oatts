import { Box, Button, Typography } from "@mui/material";
import { useEffect } from "react";
import { motion } from "motion/react";
import { TransitionParams } from "../../theme/TransitionParams";
import { useRouteContext } from "@tanstack/react-router";
import { UserStatusFlag } from "@/core/model/UserModel";
import { addUserStatusFlag } from "../../core/authentication/UserStatusFlag";

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
