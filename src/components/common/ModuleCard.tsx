import { CompletionStatus, Module } from "@/core/model/OattsModel";
import { Box, Card, CardContent, IconButton, Menu, MenuItem, Typography, useTheme } from "@mui/material";
import ModulePreviewImage from "../module/ModulePreviewImage";
import { AnimatePresence, motion } from "motion/react";
import { CalculateEstimatedDuration, calculateModuleCompletionStatus, CompletionStatusToString } from "../../core/modules/ModuleUtils";
import { DurationToString } from "../../core/utils/TimeStuff";
import { resetUserAssessment } from "../../core/database/Content";
import { useAuth } from "@/contexts/hooks/useAuth";
import { useRouter } from "@tanstack/react-router";
import { MoreVert } from "@mui/icons-material";
import { useState } from "react";
import dayjs from "dayjs";

export default function ModuleCard({ module }: { module: Module }) {
  let [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const timeToComplete = module.timeToComplete == undefined ? CalculateEstimatedDuration(module) : dayjs.duration(module.timeToComplete, 'seconds');
  const completionStatus = calculateModuleCompletionStatus(module);
  const { user } = useAuth();
  const router = useRouter();
  const completed = completionStatus === CompletionStatus.Completed;
  const theme = useTheme();


  const closeMenu = () => setMenuAnchor(null);
  const resetProgress = () => Promise.all(
    module.contents
      .map((x) => x.metadata.id)
      .map((id) => {
        user && resetUserAssessment(user, id);
      }),
  ).finally(() => {
    router.invalidate();
  });


  return (
    <AnimatePresence>
      <Card
        variant="elevation"
        component={motion.div}
        initial={{
          opacity: 0,
          scale: 0.8,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.background.paper,
        }}
        exit={{
          opacity: 0,
          scale: 1.2,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: { duration: 0.25, ease: "easeOut" },
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.background.paper,
        }}
        whileHover={{
          scale: 1.03,
          backgroundColor: theme.palette.action.cardHover,
          color: theme.palette.action.cardHover,
          transition: { duration: 0.25, type: "spring" },
        }}
        sx={{
          height: "100%",
          overflow: "hidden",
          padding: "0",
          position: "relative"
        }}
        onClick={(e) => {
          if (menuAnchor != null) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        <div>
          <IconButton sx={{
            position: "absolute",
            zIndex: 76,
            top: 0,
            right: 0
          }} onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            setMenuAnchor(event.currentTarget)
          }}>
            <MoreVert />
          </IconButton>

          <Menu
            id="long-menu"
            anchorEl={menuAnchor}
            open={menuAnchor != null}
            onClose={closeMenu}
          >
            <MenuItem key="reset" disabled={completionStatus == CompletionStatus.NotStarted} onClick={(e) => { e.stopPropagation(); e.preventDefault(); resetProgress(); closeMenu(); }}>
              Reset Progress
            </MenuItem>
          </Menu>

        </div>


        <CardContent
          sx={{
            display: "grid",
            gridTemplateRows: "14rem auto",
            backgroundColor: "inherit",
            height: "100%",
          }}
        >

          <Box
            sx={{
              overflow: "hidden",
              marginBottom: "5px",
              backgroundColor: "inherit",
            }}
          >
            <ModulePreviewImage completed={completed} src={module.previewImage} name={module.name} />
          </Box>
          <Box
            sx={{
              padding: "10px",
              boxShadow: "0 -10px 20px 20px",
              color: "inherit",
              zIndex: 100,
            }}
          >
            <Box
              sx={{
                color: "initial",
                display: "grid",
                height: "100%",
                gridTemplateRows: "auto 1fr 0.5fr 0.5fr",
              }}
            >
              <Typography variant="h6">{module.name}</Typography>
              <Typography variant="caption">{module.description}</Typography>
              <Typography sx={{ alignSelf: "end" }} variant="blended">
                {DurationToString(timeToComplete)}
              </Typography>
              <Typography sx={{ textAlign: "center" }} variant="caption">
                {CompletionStatusToString(completionStatus)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </AnimatePresence>
  );
}
