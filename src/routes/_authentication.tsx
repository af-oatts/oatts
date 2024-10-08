import { createFileRoute, Outlet } from "@tanstack/react-router";
import PlaneImage from "@/assets/welcome-f16.png";
import { Home } from "@mui/icons-material";
import { IconButtonLink } from "@/components/common/LinkButtons";
import { Box, Paper } from "@mui/material";

export const Route = createFileRoute("/_authentication")({
  component: AuthenticationLayout,
});

export default function AuthenticationLayout() {
  return (
    <Box
      sx={{
        display: "flex",
        backgroundImage: `url(${PlaneImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <IconButtonLink size="medium" to="/" sx={{ top: "5px", left: "5px", position: "absolute" }}>
        <Home />
      </IconButtonLink>
      <Paper
        sx={{
          position: "relative",
          width: 500,
          mx: "auto", // margin left & right
          py: 3, // padding top & bottom
          px: 2, // padding left & right
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRadius: "12px",
          boxShadow: "md",
        }}
        variant="outlined"
      >
        <Outlet />
      </Paper>
    </Box>
  );
}
