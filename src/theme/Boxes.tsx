import { SxProps, Theme } from "@mui/material";

export const FlexCenteredCSS: SxProps = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100%",
};

export const PageStyleCSS: SxProps<Theme> = (theme: Theme) => ({
  height: "100%",
  width: "100%",
  display: "grid",
  padding: "3rem",
  alignItems: "center",
  justifyContent: "center",
  gridTemplateColumns: "1fr",
  background: theme.palette.background.gradient,
});
