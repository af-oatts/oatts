
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { Box, Button, Typography } from "@mui/material";
import { motion } from "motion/react";
import { TransitionParams } from "../../theme/TransitionParams";

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
