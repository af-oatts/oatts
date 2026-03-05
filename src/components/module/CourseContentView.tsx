/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
import { Box, Button, Typography } from "@mui/material";
import { motion, useAnimate } from "motion/react";
import ContentViewer from "@/components/module/ContentViewer";
import { CompletionStatus, CourseContent } from "@/core/model/OattsModel";
import { useEffect } from "react";
import { useStatus } from "@/contexts/hooks/useStatus";

interface CourseContentViewProps {
  content: CourseContent,
  hasNext: boolean,
  courseName: string,
  progress: () => void,
  paNumber?: string
}

export function CourseContentView({ content, hasNext, progress, courseName, paNumber }: CourseContentViewProps) {
  const [scope, animate] = useAnimate();
  const status = useStatus(content.id);

  useEffect(() => {
    if (!scope.current) return;
    if (status && status.completionStatus === CompletionStatus.Completed) {
      animate(scope.current, { marginBottom: "0px" });
    } else {
      animate(scope.current, { marginBottom: "-100px" });
    }
  }, [status, scope]);


  return (
    <Box id="context-box" sx={{ width: "100%", display: "grid", gridTemplateRows: "1fr auto", overflow: "hidden" }}>
      <div style={{ height: "100%", gridArea: "1 / 1", display: "flex", flexDirection: "column" }}>
        <Box sx={{ flex: 1 }}>
          <ContentViewer content={content} />
        </Box>
        <Box sx={{ textAlign: "center", flexShrink: 0 }}>{paNumber}</Box>
      </div>

      <Box
        component={motion.div}
        ref={scope}
        sx={{
          gridArea: "2",
        }}
      >
        <Box sx={{ alignItems: "center", margin: "5px", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <Typography variant="h6">{hasNext? content.name : courseName} Complete</Typography>
          <Button sx={{ width: "10em", justifySelf: "end" }} variant="contained" onClick={progress}>
            {hasNext? "Next" : "Dashboard"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
