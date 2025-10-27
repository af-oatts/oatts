import { OldModule } from "@/core/model/OattsModel";
import { Box, Button, Typography } from "@mui/material";
import { motion, useAnimate } from "motion/react";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export function ModuleCompletionView({ module }: { module: OldModule }) {
  const navigate = useNavigate();
  const [scope, animate] = useAnimate();
  const { t } = useTranslation("moduleCompletion");

  useEffect(() => {
    if (scope.current === undefined) {
      return;
    }
    animate(scope.current, { opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } });
  }, []);

  function toDashboard() {
    navigate({ to: "/dashboard" });
  }

  return (
    <Box
      component={motion.div}
      ref={scope}
      sx={(theme) => ({
        height: "100%",
        width: "100%",
        display: "grid",
        padding: "3rem",
        alignItems: "center",
        justifyContent: "center",
        gridTemplateColumns: "1fr",
        background: theme.palette.background.gradient,
      })}
    >
      <Typography variant="h4" style={{textAlign: 'center'}}>
        {t("header", { moduleName: module.name })}
      </Typography>
      <div style={{textAlign: 'center'}}>{t("completionMessage")}</div>
      <div style={{ display: "flex", width: "100%", gap: "1rem", justifyContent: "center", marginTop: "2rem" }}>
        <Button variant="contained" onClick={toDashboard}>
          {t("confirmButton")}
        </Button>
      </div>
    </Box>
  );
}
