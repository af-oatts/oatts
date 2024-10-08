import { Box, Button, ButtonGroup, Typography } from "@mui/material";
import { motion, useAnimate } from "motion/react";

import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { FlexCenteredCSS, PageStyleCSS } from "@/theme/Boxes";

export function CourseCompletionView() {
  const navigate = useNavigate();
  const [scope] = useAnimate();
  const { t } = useTranslation("courseCompletion");
  return (
    <Box component={motion.div} ref={scope} sx={PageStyleCSS}>
      <Typography variant="h4" textAlign="center">
        {t("header")}
      </Typography>
      <div style={{textAlign: 'center'}}>{t("completionMessage")}</div>
      <Box sx={FlexCenteredCSS}>
        <ButtonGroup aria-label="Button Group" color="primary">
          <Button variant="contained" aria-label="Export Button">
            {t("exportButton")}
          </Button>
          <Button variant="contained" aria-label="Dashboard Button" onClick={() => navigate({ to: "/dashboard" })}>
            {t("confirmButton")}
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
}
