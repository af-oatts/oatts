import { Box, CircularProgress } from "@mui/material";
import { motion, useAnimate } from "motion/react";
import ContentViewer from "@/components/module/ContentViewer";

import { useParams } from "@tanstack/react-router";
import { ContentNavigationComponent } from "@/components/module/ContentNavigationComponent";

import { CourseController } from "../../contexts/models/CourseController";
import { getFileRoute } from "./getFileRoute";
import { CompletionStatus } from "@/core/model/OattsModel";
import { useEffect } from "react";

export function CourseContentView({ controller }: { controller: CourseController }) {
  const FILE_ROUTE = getFileRoute(controller.contentType);
  const { contentId } = useParams({ from: FILE_ROUTE });
  const [scope, animate] = useAnimate();

  const content = controller.getContent(contentId);
  const state = controller.getState(contentId);

  useEffect(() => {
    if (controller.isLoading || !scope.current) return;
    if (state && state.completionStatus === CompletionStatus.Completed) {
      animate(scope.current, { marginBottom: "0px" });
    } else {
      animate(scope.current, { marginBottom: "-100px" });
    }
  }, [controller, state, scope]);

  if (controller.isLoading) return <Box id="context-box" sx={{ width: "100%", height: "100%" }} ><CircularProgress/></Box>;
  if (!(controller.course && content && state)) return <Box id="context-box" sx={{ width: "100%", height: "100%" }} ></Box>;

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
        ref={scope}
        sx={{
          gridArea: "2",
        }}
      >
        <Box sx={{ alignItems: "center", margin: "5px", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <ContentNavigationComponent
            next={controller.getNext()}
            contentName={content?.name}
            contentType={controller.contentType}
          />
        </Box>
      </Box>
    </Box>
  );
}
