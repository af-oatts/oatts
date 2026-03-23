
import { CompletionStatus, CourseContentItemType, CourseContent } from "@/core/model/OattsModel";
import { Box } from "@mui/material";
import { useRouteContext } from "@tanstack/react-router";
import { motion, useAnimate } from "motion/react";
import { useEffect, useRef } from "react";
import { loadModel } from "../../../core/scorm/ScormHelper";
import { GetContentURL } from "@/core/modules/ModuleUtils";
import { ScormStateToStatus } from "@/core/scorm/ScormInternalizer";

import { setupCSPViolationReporting } from "../../../utils/CSPHelper";
import { useSetStatus, useStatus } from "@/contexts/hooks/useStatus";

/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
export function ScormContentViewer({ content }: { content: CourseContent }) {
    const contentFrameRef = useRef<HTMLIFrameElement>(null);
    const [frameScope, frameAnimate] = useAnimate();
    const status = useStatus(content.id);
    const setStatus = useSetStatus();

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
        if (user == undefined) {
            return;
        }

        loadModel(user, content.id).then((model) => {
            window.API_1484_11.SetModel(model);
            window.API_1484_11.SetContent(content);
            window.API_1484_11.SetUpdateStateCallback((scormState) => {
                let newStatus = ScormStateToStatus(scormState);
                setStatus(content.id, newStatus);
            });
        });

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
            setStatus(content.id, { ...status, completionStatus: CompletionStatus.Completed })
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