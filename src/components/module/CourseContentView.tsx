import { Box } from "@mui/material";
import { motion } from "motion/react";
import ContentViewer from "@/components/module/ContentViewer";

import { useParams } from "@tanstack/react-router";
import { ContentNavigationComponent } from "@/components/module/ContentNavigationComponent";

import { CourseController } from "./useCourseContentState";

const FILE_ROUTE = "/_authenticated/_authorized/courses/$courseId/content/$contentId";

export function CourseContentView({ controller }: { controller: CourseController }) {
  const { contentId } = useParams({ from: FILE_ROUTE });

  const content = controller.getContent(contentId);
  const state = controller.getState(contentId);

  if (controller.isLoading) return <Box id="context-box" sx={{ width: "100%", height: "100%" }} />;
  if (!(controller.course && content && state)) return <Box id="context-box" sx={{ width: "100%", height: "100%" }} />;

  return (
    <Box id="context-box" sx={{ width: "100%", display: "grid", gridTemplateRows: "1fr auto", overflow: "hidden" }}>
      <div style={{ height: "100%", gridArea: "1 / 1", display: "flex", flexDirection: "column" }}>
        <Box sx={{ flex: 1 }}>
          <ContentViewer content={content} state={state} />
        </Box>
        <Box sx={{ textAlign: "center", flexShrink: 0 }}>{controller.course.paNumber}</Box>
      </div>

      <Box
        component={motion.div}
        // ref={scope}
        sx={{
          gridArea: "2",
        }}
      >
        <Box sx={{ alignItems: "center", margin: "5px", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <ContentNavigationComponent next={controller.getNext()} contentName={content?.name} />
        </Box>
      </Box>
    </Box>
  );
}
