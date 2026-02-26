/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
import { Box, List } from "@mui/material";
import { Course } from "@/core/model/OattsModel";
import { ContentMenuItem } from "./ContentMenu";

export function CourseContentSideNav({ course, contentId, setContentId }: { course: Course, contentId: string, setContentId: (id : string) => void }) {

    return (
        <Box sx={{ overflowY: "auto" }}>
            <List component="nav">
                {(course.contents || []).map((c) => (
                    <ContentMenuItem
                        key={c.id}
                        contentItem={c}
                        isSelected={(id) => contentId === id}
                        setContent={setContentId}
                    />
                ))}
            </List>
        </Box>
    );
}
