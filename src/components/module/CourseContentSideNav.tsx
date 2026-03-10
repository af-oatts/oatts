
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
import { Box, List } from "@mui/material";
import { CourseContent } from "@/core/model/OattsModel";
import { ContentMenuItem } from "./ContentMenu";

export function CourseContentSideNav({ contents, contentId, setContentId }: { contents: CourseContent[], contentId: string, setContentId: (id : string) => void }) {

    return (
        <Box sx={{ overflowY: "auto" }}>
            <List component="nav">
                {(contents || []).map((c) => (
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
