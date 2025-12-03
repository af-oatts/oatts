import { ContentState, CourseContentItemType, CourseContent, CompletionStatus } from "@/core/model/OattsModel";
import { Box, Collapse, List, ListItemButton, ListItemButtonProps, ListItemText } from "@mui/material";

import { useMemo, useState } from "react";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { ContentCompletionIndicator } from "@/components/module/ContentCompletionIndicator";

function CollapsibleMenuItem(props: ContentMenuItemProps) {
  const [open, setOpen] = useState(false);
  const { contentItem, getState, ...rest } = props;
  const completionStatus = useMemo(() => {
    const states = contentItem.children?.map(c => getState(c.id));
    const isAllDone = states?.every(s => s? s.completionStatus === CompletionStatus.Completed: false);
    const isUnstarted = states?.every(s => s? s.completionStatus === CompletionStatus.NotStarted : false);
    return isAllDone? CompletionStatus.Completed : (isUnstarted? CompletionStatus.NotStarted : CompletionStatus.Started)
  }, [contentItem.children, getState])

  function handleClick() {
    setOpen(!open);
  }

  return (
    <>
      <ListItemButton onClick={handleClick}>
        <Box width="100%" display="grid" gridTemplateColumns="30px 1fr auto" alignItems="center">
          {open ? <ExpandLess /> : <ExpandMore />}
          <ListItemText primary={contentItem.name} />
          <ContentCompletionIndicator completion={completionStatus} />
 
        </Box>
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ paddingRight: 0 }}>
          {contentItem.children?.map((c) => <ContentMenuItem key={c.id} getState={getState} contentItem={c} {...rest} />)}
        </List>
      </Collapse>
    </>
  );
}

interface ContentMenuItemProps extends ListItemButtonProps {
  contentItem: CourseContent;
  getState: (id: string) => ContentState | undefined;
  setContent: (id: string) => void;
   isSelected: (id: string) => boolean;
}

export function ContentMenuItem(props: ContentMenuItemProps) {
  const { contentItem, getState, onClick, setContent, isSelected, ...rest } = props;

  if (contentItem.type == CourseContentItemType.SUBMODULE) {
    return <CollapsibleMenuItem {...props} />;
  }

  return (
    <>
      <ListItemButton {...rest} onClick={(_) => setContent(contentItem.id)} selected={isSelected(contentItem.id)}>
        <Box width="100%" display="grid" gridTemplateColumns="1fr auto" alignItems="center">
          <ListItemText primary={contentItem.name} />
          <ContentCompletionIndicator completion={getState(contentItem.id)?.completionStatus} />
        </Box>
      </ListItemButton>
    </>
  );
}
