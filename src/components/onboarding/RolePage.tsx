import { Box, Checkbox, FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material";
import { AnimatePresence, motion } from "motion/react";
import { TransitionParams } from "../../theme/TransitionParams";
import { useEffect, useState } from "react";
import { useRouteContext } from "@tanstack/react-router";
import { AddUserCategories, ClearUserCategories as ClearUserRoles } from "../../core/authentication/Authenticator";
import { NextButton, PreviousButton } from "./OnboardNavButtons";

export default function RolePage({ onNext, onPrevious }: { onNext: () => void; onPrevious: () => void }) {
  let [canProceed, setCanProceed] = useState(false);
  let ctx = useRouteContext({ from: "/_authenticated" });
  let roles = ctx.config.roles;
  let user = ctx.authentication.user;
  const [selectedScenario, setSelectedScenario] = useState<UserScenario>(UserScenario.GENERAL);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, boolean>>({});
  let handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRoles({
      ...selectedRoles,
      [event.target.value]: event.target.checked,
    });
  };

  useEffect(() => {
    let proceed = Object.keys(selectedRoles).filter((key) => selectedRoles[key]).length > 0;
    let generalScenario = selectedScenario == UserScenario.GENERAL;
    setCanProceed(proceed || generalScenario);
  }, [selectedRoles, selectedScenario]);

  async function updateAndProceed() {
    if (user === undefined) {
      return;
    }

    await ClearUserRoles(user.email);
    const roles = getRoles();
    await AddUserCategories(user.email, roles);
    user.roles = roles;
    onNext();
  }

  function getRoles() {
    if (selectedScenario == UserScenario.IMPROVE) {
      return Object.keys(selectedRoles).filter((key) => selectedRoles[key]);
    }

    if (selectedScenario == UserScenario.GENERAL) {
      return roles.filter(r => r.general).map(r => r.id);
    }

    return [];
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
              Please select your primary goal
            </Typography>
            <Box
              component={motion.div}
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
              {...TransitionParams({ delay: 0.5 })}
            >
              <RadioGroup value={selectedScenario} onChange={(e) => setSelectedScenario(e.target.value as UserScenario)}>
                <FormControlLabel value={UserScenario.GENERAL} label="General AFOQT preparation" control={<Radio />} />
                <FormControlLabel value={UserScenario.IMPROVE} label="Improve my AFOQT scores" control={<Radio />} />
              </RadioGroup>
              <AnimatePresence>
                {selectedScenario == UserScenario.IMPROVE ?
                  <motion.div key="role-expander" transition={{ ease: "easeOut", duration: 0.5 }} initial={{ height: "0px", opacity: 0 }} animate={{ height: "100%", opacity: 1 }} exit={{ height: "10px", opacity: 0 }} style={{ display: "flex", flexDirection: "column", overflow: "auto" }}>
                    {roles.map((role) => {
                      return (
                        <FormControlLabel
                          key={role.id}
                          control={<Checkbox onChange={handleRoleChange} value={role.id} />}
                          label={role.name}
                          sx={{
                            padding: "0px",
                            marginLeft: "10px"
                          }}
                        />
                      );
                    })}
                  </motion.div> : <></>
                }
              </AnimatePresence>
            </Box>
          </Box>
        </Box>

        <PreviousButton onClick={onPrevious}>
          Previous
        </PreviousButton>
        <NextButton disabled={!canProceed} onClick={updateAndProceed}>
          Next
        </NextButton>
      </Box>
    </>
  );
}

enum UserScenario {
  GENERAL = "general",
  IMPROVE = "improve"
}
