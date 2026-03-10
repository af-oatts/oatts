
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { LinearProgressProps, Box, LinearProgress, Typography, linearProgressClasses } from "@mui/material";

export default function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress
          variant="determinate"
          {...props}
          sx={(theme) => ({
            [`& .${linearProgressClasses.bar}`]: {
              backgroundColor: theme.palette.progress.indicatorColor,
              borderRadius: "10px",
            },
          })}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="body2"
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            userSelect: "none",
            textAlign: "center",
          })}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}
