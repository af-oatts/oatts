
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { Box, Button, Typography } from "@mui/material";
import { motion, useAnimate } from "motion/react";
import confetti from "canvas-confetti"
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { FlexCenteredCSS, PageStyleCSS } from "@/theme/Boxes";
import { useEffect } from "react";
import { FileDownload, Home } from "@mui/icons-material";

export function CourseCompletionView() {
  const navigate = useNavigate();
  const [scope] = useAnimate();
  const { t } = useTranslation("courseCompletion");
  const scalar = 2;
  const unicorn = confetti.shapeFromText({ text: "🦄", scalar: scalar})

  const yayFireworks = (manual: boolean) => {
    const rand = Math.random();
    if (manual && rand < .1) {
      // 10% chance of getting unicorns. Just because.
      confetti({ spread: 360, ticks: 200, zIndex: 0, startVelocity: 30, particleCount: 80, origin: { x: 0.5, y: 0.3 }, shapes: [unicorn], scalar: scalar})
    }
    else {
      confetti({ spread: 360, ticks: 200, zIndex: 0, startVelocity: 30, particleCount: 80, origin: { x: 0.5, y: 0.3 } })

    }
  }


  useEffect(() => { setTimeout(() => { yayFireworks(false) }, 100) }, []);

  return (
    <Box component={motion.div} ref={scope} sx={PageStyleCSS}>
      <Typography variant="h1" textAlign="center">
        {t("header")}
      </Typography>
      <Typography onClick={() => yayFireworks(true)} textAlign='center' variant="h1" sx={{ cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' }}>
        🎉
      </Typography>

      <Typography textAlign='center' variant="h6">
        {t("completionMessage")}
      </Typography>
      <Box sx={{ ...FlexCenteredCSS, gap: 2, mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          aria-label="Export Button"
          endIcon={<FileDownload />}
          sx={{ px: 3, fontWeight: 600 }}
        >
          {t("exportButton")}
        </Button>

        <Button
          variant="outlined"
          color="inherit"
          size="large"
          aria-label="Dashboard Button"
          onClick={() => navigate({ to: "/dashboard" })}
          endIcon={<Home />}
          sx={{ px: 3, fontWeight: 600 }}
        >
          {t("confirmButton")}
        </Button>
      </Box>
    </Box >
  );
}
