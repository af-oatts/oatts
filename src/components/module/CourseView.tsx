/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
import { Box, Divider } from "@mui/material";
import { motion } from "motion/react";

import { OLD_CourseContentView } from "./old/OLD_CourseContentView";
import { OLD_CourseContentSideNav } from "./old/OLD_CourseContentSideNav";
import { Course } from "@/core/model/OattsModel";

export default function CourseView(course: Course, paNumberOverrides? : Map<string, string>) {
  return (
    <Box
      layout
      id="module-viewer"
      component={motion.div}
      sx={(theme) => ({
        height: "100%",
        flex: "auto",
        width: "100%",
        display: "grid",
        overflow: "hidden",
        gridTemplateColumns: "1fr auto 3fr",
        background: theme.palette.background.gradient,
      })}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } }}
    >
      <OLD_CourseContentSideNav {...{ controller }} />
      <Divider orientation="vertical" sx={{ gridColumn: "2" }} />
      <OLD_CourseContentView {...{ controller }} />
    </Box>
  );
}
