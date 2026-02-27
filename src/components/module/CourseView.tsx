/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
import { Box, Divider } from "@mui/material";
import { motion } from "motion/react";
import { CompletionStatus, Course, CourseContent } from "@/core/model/OattsModel";
import { CourseContentSideNav } from "./CourseContentSideNav";
import { CourseContentView } from "./CourseContentView";
import ErrorPage from "../error-page";
import { FlattenContents } from "@/utils/Flattener";
import { useStatuses } from "@/contexts/hooks/useStatus";
import { useCallback, useMemo } from "react";
import { Status } from "@/core/model/Status";

interface CourseViewProps {
    contents: CourseContent[],
    courseName: string,
    contentID: string,
    setContentID: (id: string) => void,
    finish: () => void,
    paNumber?: string
}

export default function CourseView({ contents, courseName, contentID, setContentID, finish, paNumber }: CourseViewProps) {
    const allContent = FlattenContents(contents);
    const contentIndex = allContent.findIndex(c => c.id === contentID);
    const content = contentIndex !== undefined ? allContent[contentIndex] : undefined;
    const statuses = useStatuses(allContent.map(c => c.id));
    const next = useMemo(() => statuses ? determineNext(allContent, statuses, contentIndex) : undefined, [statuses]);

    const progress = useCallback(() => {
        console.log(next);
        
        if (next) {
            setContentID(next.id);
            return;
        }
        finish();
    }, [next]);


    if (!content) {
        return <ErrorPage details={`Cannot find content ${contentID} in course ${courseName} (even in its deepest descendants)`}></ErrorPage>
    }

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
            <CourseContentSideNav contents={contents} contentId={contentID} setContentId={setContentID} />
            <Divider orientation="vertical" sx={{ gridColumn: "2" }} />
            <CourseContentView content={content} courseName={courseName} hasNext={next != undefined} progress={progress} paNumber={paNumber} />
        </Box>
    );
}



// content needs to be depth first.
function determineNext(contents: CourseContent[], statuses: Map<string, Status | undefined>, currentIndex: number) {
    // Try to go forwards first if possible. 
    for (let i = currentIndex; i < contents.length; i++) {
        const content = contents[i];
        if (content.children) {
            continue;
        }
        const status = statuses.get(content.id);
        if (!status || status.completionStatus !== CompletionStatus.Completed) {
            return content;
        }
    }
    // Otherwise find the next closest.
    for (let i = 0; i < currentIndex; i++) {
        const content = contents[i];
        if (content.children) {
            continue;
        }
        const status = statuses.get(content.id);
        if (!status || status.completionStatus !== CompletionStatus.Completed) {
            return content;
        }
    }
    return undefined;
}