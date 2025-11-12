import { CompletionStatus, ContentState, CourseContentItemType, CourseContent } from "@/core/model/OattsModel";
import { Box } from "@mui/material";
import { useRouteContext } from "@tanstack/react-router";
import { motion, useAnimate } from "motion/react";
import { useEffect, useRef } from "react";
import { loadModel } from "../../core/scorm/ScormHelper";
import { GetContentURL } from "@/core/modules/ModuleUtils";
import { ScormStateToInternalState } from "@/core/scorm/ScormInternalizer";
import { useSetContentState } from "@/contexts/hooks/useSetContentState";

import { setupCSPViolationReporting } from "../../utils/CSPHelper";

export default function ContentViewer({ content, state }: { content: CourseContent; state: ContentState }) {
  const contentFrameRef = useRef<HTMLIFrameElement>(null);
  const [frameScope, frameAnimate] = useAnimate();
  const setContentState = useSetContentState();

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
    // Setup CSP violation reporting for security monitoring
    setupCSPViolationReporting();
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
        window.API_1484_11.SetUpdateStateCallback((scormState) => {
          let newState = ScormStateToInternalState(scormState, content.id);
          setContentState(content.id, newState);
        });
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
      // Security: Set iframe src with additional security attributes
      const contentUrl = GetContentURL(content);
      currentFrameRef.src = contentUrl;

      // Apply security attributes to iframe
      currentFrameRef.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups allow-modals");
      currentFrameRef.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");

      // Log content loading for security monitoring
      console.log(`Loading SCORM content: ${contentUrl.substring(0, 100)}...`);
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

  // Wait a second then show next button if not scorm.
  useEffect(() => {
    if (content.type === CourseContentItemType.SCORM) {
      return;
    }
    const timeout = setTimeout(() => {
      setContentState(content.id, { ...state, completionStatus: CompletionStatus.Completed });
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
          <iframe
            style={{ border: 0 }}
            width="100%"
            height="100%"
            ref={contentFrameRef}
            onLoad={animateScope}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            referrerPolicy="strict-origin-when-cross-origin"
            title="SCORM Content Viewer"
          ></iframe>
        </Box>
      </Box>
    </Box>
  );
}
