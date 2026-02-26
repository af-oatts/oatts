/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
import { Box, Divider } from "@mui/material";
import { motion } from "motion/react";
import { Course } from "@/core/model/OattsModel";
import { CourseContentSideNav } from "./CourseContentSideNav";
import { CourseContentView } from "./CourseContentView";

interface CourseViewProps {
    course: Course,
    contentID: string,
    setContentID: (id: string) => void,
    paNumberOverrides?: Map<string, string>
}

export default function CourseView({ course, contentID, setContentID, paNumberOverrides }: CourseViewProps) {
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
            <CourseContentSideNav course={course} contentId={contentID} setContentId={setContentID} />
            <Divider orientation="vertical" sx={{ gridColumn: "2" }} />
            <CourseContentView course={course} path={path} paNumberOverrides={paNumberOverrides} />
        </Box>
    );
}
