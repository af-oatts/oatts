
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { Box, Checkbox, CircularProgress, FormControlLabel, FormGroup, Typography } from "@mui/material";
import { motion } from "motion/react";
import { TransitionParams } from "../../theme/TransitionParams";
import { useMemo, useState } from "react";
import { useRouteContext } from "@tanstack/react-router";
import { AddUserCategories, ClearUserCategories as ClearUserRoles } from "../../core/authentication/Authenticator";
import { NextButton, PreviousButton } from "./OnboardNavButtons";
import { useGoals } from "@/contexts/providers/CourseContextProvider";
import { Goal } from "@/core/model/OattsModel";

export default function RolePage({ onNext, onPrevious }: { onNext: () => void; onPrevious: () => void }) {

  let ctx = useRouteContext({ from: "/_authenticated" });
  let user = ctx.authentication.user;
  const [goals, isLoading] = useGoals();
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const mayProceed = useMemo(() => selectedGoals.length != 0, [selectedGoals]);

  async function updateAndProceed() {
    if (user === undefined) {
      return;
    }

    await ClearUserRoles(user.email);
    let roleIds = new Set<string>();
    for (let goal of selectedGoals) {
      goal.roleIDs.forEach(rid => roleIds.add(rid))
    }
    let roleIdsArr = [...roleIds]
    await AddUserCategories(user.email, roleIdsArr);
    user.roles = roleIdsArr;
    onNext();
  }

  if (isLoading) {
    return <CircularProgress />
  }

  return (
    <>
      <Box
        display="grid"
        gridTemplateColumns="50px 200px 1fr 200px 50px"
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
              key="interestBanner"
              component={motion.span}
              {...TransitionParams({ endOpacity: 0.8 })}
              variant="h1"
            >
              Personalization
            </Typography>
            <Typography
              key="interestDescription"
              component={motion.span}
              {...TransitionParams({ delay: 0.25 })}
              variant="body1"
            >
              Please select all that apply
            </Typography>
            <Box
              component={motion.div}
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
              {...TransitionParams({ delay: 0.5 })}
            >
              <FormGroup>
                {goals?.map(goal => (
                  <FormControlLabel
                    key={goal.id}
                    control={
                      <Checkbox
                        checked={selectedGoals.some(g => g.id === goal.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGoals([...selectedGoals, goal]);
                          } else {
                            setSelectedGoals(selectedGoals.filter(g => g.id !== goal.id));
                          }
                        }}
                      />
                    }
                    label={goal.name}
                  />
                ))}
              </FormGroup>

            </Box>
          </Box>
        </Box>

        <PreviousButton onClick={onPrevious}>
          Previous
        </PreviousButton>
        <NextButton disabled={!mayProceed} onClick={updateAndProceed}>
          Next
        </NextButton>
      </Box>
    </>
  );
}