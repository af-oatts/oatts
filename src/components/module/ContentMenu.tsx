
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
import { CourseContent, CompletionStatus } from "@/core/model/OattsModel";
import { Box, Collapse, List, ListItemButton, ListItemButtonProps, ListItemText } from "@mui/material";
import { useStatus, useStatuses } from "@/contexts/hooks/useStatus";
import { useMemo, useState } from "react";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import WarningIcon from "@mui/icons-material/Warning";
import { motion } from "motion/react";
import { FlattenContents } from "@/utils/Flattener";


interface ContentMenuItemProps extends ListItemButtonProps {
    // "Content" conflicts with listitembuttonprops.
    contentItem: CourseContent;
    setContent: (id: string) => void;
    isSelected: (id: string) => boolean;
}

function CollapsibleMenuItem({ contentItem, ...rest }: ContentMenuItemProps) {
    const [open, setOpen] = useState(false);
    const allChildren = [contentItem, ...(contentItem.children ? FlattenContents(contentItem.children) : [])];
    const statusMap = useStatuses(allChildren.map(c => c.id));


    const derivedStatus = useMemo(() => {
        if (!statusMap) {
            return undefined;
        }
        const statuses = [...statusMap.values()];
        if (statuses.every(status => status?.completionStatus === CompletionStatus.Completed)) {
            return CompletionStatus.Completed;
        }
        if (statuses.every(status => status?.completionStatus === CompletionStatus.NotStarted)) {
            return CompletionStatus.Completed;
        }
        if (statuses.some(status => status?.completionStatus === CompletionStatus.Completed || status?.completionStatus === CompletionStatus.Started)) {
            return CompletionStatus.Completed;
        }
    }, [statusMap]);


    return (
        <>
            <ListItemButton
                onClick={() => setOpen(!open)}
            >
                <Box width="100%" display="grid" gridTemplateColumns="30px 1fr auto" alignItems="center">
                    {open ? <ExpandLess /> : <ExpandMore />}
                    <ListItemText primary={contentItem.name} />
                    <ContentCompletionIndicator completion={derivedStatus} />

                </Box>
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ paddingRight: 0 }}>
                    {contentItem.children?.map((c) => <ContentMenuItem key={c.id} contentItem={c} {...rest} />)}
                </List>
            </Collapse>
        </>
    );
}



export function ContentMenuItem({ contentItem, onClick, setContent, isSelected, ...rest }: ContentMenuItemProps) {
    const status = useStatus(contentItem.id) // If it's a submodule it'll just return undefined.

    return (contentItem.children ?
        <><CollapsibleMenuItem contentItem={contentItem} isSelected={isSelected} setContent={setContent} {...rest}></CollapsibleMenuItem></>
        :
        <>
            <ListItemButton {...rest} onClick={(_) => setContent(contentItem.id)} selected={isSelected(contentItem.id)}>
                <Box width="100%" display="grid" gridTemplateColumns="1fr auto" alignItems="center">
                    <ListItemText primary={contentItem.name} />
                    <ContentCompletionIndicator completion={status?.completionStatus} />
                </Box>
            </ListItemButton>
        </>
    );
}





function ContentCompletionIndicator({ completion }: { completion: CompletionStatus | undefined }) {
    switch (completion) {
        case CompletionStatus.Completed:
            return (
                <CheckCircleIcon
                    component={motion.svg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    sx={(theme) => ({ color: theme.palette.progress.complete })}
                />
            );
        case CompletionStatus.Started:
            return (
                <PendingIcon
                    component={motion.svg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    sx={(theme) => ({ color: theme.palette.progress.inProgress })}
                />
            );
        case CompletionStatus.NotStarted:
            return <></>;
        case undefined:
            return <></>;
        default:
            return <WarningIcon
                component={motion.svg}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                sx={(theme) => ({ color: theme.palette.progress.inProgress })}
            />
    }
}
