import { CompletionStatus, CourseContent, CourseContentItemType } from "@/core/model/OattsModel";
import { Box } from "@mui/material";
import { useRouteContext } from "@tanstack/react-router";
import { motion, useAnimate } from "motion/react";
import { useEffect, useRef } from "react";
import { loadModel } from "../../core/scorm/ScormHelper";
import { saveContentState } from "../../core/database/Content";
import { getContentURL } from "@/core/modules/ModuleUtils";

export default function ContentViewer({ content }: { content: CourseContent }) {
  const contentFrameRef = useRef<HTMLIFrameElement>(null);
  const [frameScope, frameAnimate] = useAnimate();

  let user = useRouteContext({
    from: "/_authenticated",
    select: (ctx) => ctx.authentication.user,
  });

  function preventUnsavedChangesPopup() {
    // prevent the "unsaved changes" popup from showing up
    if (contentFrameRef.current !== null) {
      if (contentFrameRef.current?.contentWindow) {
        contentFrameRef.current.contentWindow.onbeforeunload = null;
      }
    }
  }
  useEffect(() => {
    preventUnsavedChangesPopup();
  }, [content]);

  useEffect(() => {
    if (content.type !== CourseContentItemType.SCORM) {
      // No point in setting up scorm API if the content isn't scorm
      return;
    }

    if (user !== undefined) {
      loadModel(user, content.id).then((model) => {
        window.API_1484_11.SetModel(model);
        window.API_1484_11.SetContent(content);
      });
    }
  }, [content]);

  // Whenever content changes, we slightly obscure the frame by changing the size/opacity and then
  // set the source for the frame so it can load while being "obscured"
  useEffect(() => {
    const currentFrameRef = contentFrameRef.current;
    if (currentFrameRef === undefined || currentFrameRef === null) {
      return;
    }

    const currentFrameScope = frameScope.current;
    if (currentFrameScope === undefined || currentFrameScope === null) {
      return;
    }

    frameAnimate(currentFrameScope, { opacity: 0.4, scale: 0.99 }, { duration: 0.25, ease: "easeIn" }).then(() => {
      currentFrameRef.src = getContentURL(content);
    });
  }, [content]);

  // After the iframe finishes loading the content, we bring back the frame out into full focus
  // by resetting the size/opacity
  function animateScope() {
    const currentFrameScope = frameScope.current;
    if (currentFrameScope === undefined || currentFrameScope === null) {
      return;
    }
    frameAnimate(currentFrameScope, { opacity: 1, scale: 1 }, { duration: 0.25, ease: "easeOut" });
  }

  useEffect(() => {
    if (content.type === CourseContentItemType.SCORM) {
      return;
    }
    const timeout = setTimeout(() => {
      content.state.completionStatus = CompletionStatus.Completed;
      saveContentState(user!, content);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [content]);

  return (
    <Box
      component={motion.div}
      sx={{ height: "100%", width: "100%" }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } }}
    >
      <Box sx={{ gridColumn: 3, height: "100%", width: "100%" }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          sx={{ width: "100%", height: "100%" }}
          ref={frameScope}
        >
          <iframe style={{ border: 0 }} width="100%" height="100%" ref={contentFrameRef} onLoad={animateScope}></iframe>
        </Box>
      </Box>
    </Box>
  );
}
