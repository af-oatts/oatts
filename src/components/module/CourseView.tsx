import { Box, Divider } from "@mui/material";
import { motion } from "motion/react";

import { CourseContentView } from "./CourseContentView";
import { CourseContentSideNav } from "./CourseContentSideNav";
import { CourseController } from "../../contexts/models/CourseController";

export default function CourseView({ controller }: { controller: CourseController }) {
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
      <CourseContentSideNav {...{ controller }} />
      <Divider orientation="vertical" sx={{ gridColumn: "2" }} />
      <CourseContentView {...{ controller }} />
    </Box>
  );
}
