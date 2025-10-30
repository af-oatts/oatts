import { ContentState, CourseContentItemType, StatelessCourseContent } from "@/core/model/OattsModel";
import { Box, Collapse, List, ListItemButton, ListItemButtonProps, ListItemText } from "@mui/material";

import { useState } from "react";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { ContentCompletionIndicator } from "@/components/module/ContentCompletionIndicator";

function CollapsibleMenuItem(props: ContentMenuItemProps) {
  const [open, setOpen] = useState(false);
  const { contentItem, state, ...rest } = props;

  function handleClick() {
    setOpen(!open);
  }

  return (
    <>
      <ListItemButton onClick={handleClick}>
        <Box width="100%" display="grid" gridTemplateColumns="30px 1fr auto" alignItems="center">
          {open ? <ExpandLess /> : <ExpandMore />}
          <ListItemText primary={contentItem.name} />
          <ContentCompletionIndicator completion={state?.completionStatus} />
        </Box>
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ paddingRight: 0 }}>
          {contentItem.children?.map((c) => <ContentMenuItem key={c.id} state={state} contentItem={c} {...rest} />)}
        </List>
      </Collapse>
    </>
  );
}

interface ContentMenuItemProps extends ListItemButtonProps {
  contentItem: StatelessCourseContent;
  state: ContentState | undefined,
  setContent: (id: string) => void;
  isSelected: (id: string) => boolean;
}

export function ContentMenuItem(props: ContentMenuItemProps) {
  const { contentItem, state, onClick, setContent, isSelected, ...rest } = props;


  if (contentItem.type == CourseContentItemType.SUBMODULE) {
    return <CollapsibleMenuItem {...props} />;
  }

  return (
    <>
      <ListItemButton {...rest} onClick={(_) => setContent(contentItem.id)} selected={isSelected(contentItem.id)}>
        <Box width="100%" display="grid" gridTemplateColumns="1fr auto" alignItems="center">
          <ListItemText primary={contentItem.name} />
          <ContentCompletionIndicator completion={state?.completionStatus} />
        </Box>
      </ListItemButton>
    </>
  );
}
