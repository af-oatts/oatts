import { ContentItem, ContentType } from "@/core/model/OattsModel";
import { Box, Collapse, List, ListItemButton, ListItemButtonProps, ListItemText } from "@mui/material";

import { useState } from "react";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import useCompletionStatus from "../../core/modules/hooks/useCompletionStatus";

import { ContentCompletionIndicator } from "@/components/module/ContentCompletionIndicator";

function CollapsibleMenuItem(props: ContentMenuItemProps) {
  const [open, setOpen] = useState(false);
  const { contentItem, ...rest } = props;
  const status = useCompletionStatus(contentItem);

  function handleClick() {
    setOpen(!open);
  }

  return (
    <>
      <ListItemButton onClick={handleClick}>
        <Box width="100%" display="grid" gridTemplateColumns="30px 1fr auto" alignItems="center">
          {open ? <ExpandLess /> : <ExpandMore />}
          <ListItemText primary={contentItem.metadata.name} />
          <ContentCompletionIndicator completion={status} />
        </Box>
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ paddingRight: 0 }}>
          {contentItem.subContents?.map((c) => <ContentMenuItem key={c.metadata.id} contentItem={c} {...rest} />)}
        </List>
      </Collapse>
    </>
  );
}

interface ContentMenuItemProps extends ListItemButtonProps {
  contentItem: ContentItem;
  setContent: (contentItem: ContentItem) => void;
  isSelected: (contentItem: ContentItem) => boolean;
}

export function ContentMenuItem(props: ContentMenuItemProps) {
  const { contentItem, onClick, setContent, isSelected, ...rest } = props;

  const status = useCompletionStatus(contentItem);

  if (contentItem.type == ContentType.CONTAINER) {
    return <CollapsibleMenuItem {...props} />;
  }

  return (
    <>
      <ListItemButton {...rest} onClick={(_) => setContent(contentItem)} selected={isSelected(contentItem)}>
        <Box width="100%" display="grid" gridTemplateColumns="1fr auto" alignItems="center">
          <ListItemText primary={contentItem.metadata.name} />
          <ContentCompletionIndicator completion={status} />
        </Box>
      </ListItemButton>
    </>
  );
}
