import { Box, CircularProgress, Stack, Typography } from "@mui/material";

export function BigLoadingScreen({ name }: { name?: string }) {
  return (
    <Box width="100%" height="100%" sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Stack gap="10px" sx={{ justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
        <Typography sx={{ opacity: 0.6 }} variant="h5">
          Loading {name}
        </Typography>
      </Stack>
    </Box>
  );
}
