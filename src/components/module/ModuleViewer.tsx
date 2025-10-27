import { CompletionStatus, OldContentItem } from "@/core/model/OattsModel";
import { Box, Button, Divider, List, Typography } from "@mui/material";
import { motion, useAnimate } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import ContentViewer from "./ContentViewer";
import { FlattenContents } from "../../core/modules/ModuleUtils";
import { useNavigate } from "@tanstack/react-router";
import { ContentMenuItem } from "@/components/common/ContentMenu";

function firstIncomplete(contentItems: OldContentItem[]): OldContentItem | undefined {
  const incomplete = contentItems.find((c) => c.state.completionStatus !== CompletionStatus.Completed);
  return incomplete;
}

function firstIncompleteOrDefault(contentItems: OldContentItem[]): OldContentItem {
  return firstIncomplete(contentItems) ?? contentItems[0];
}

function nextIncomplete(contentItems: OldContentItem[], currentItem: OldContentItem): OldContentItem | undefined {
  const currentItemIdx = contentItems.indexOf(currentItem);
  const firstHalf = contentItems.slice(currentItemIdx);
  const secondHalf = contentItems.slice(0, currentItemIdx);
  const searchArray = [...firstHalf, ...secondHalf];
  const incomplete = searchArray.find((c) => c.state.completionStatus !== CompletionStatus.Completed);
  return incomplete;
}

function nextIncompleteOrDefault(contentItems: OldContentItem[], currentItem: OldContentItem): OldContentItem {
  return nextIncomplete(contentItems, currentItem) ?? contentItems[0];
}

function nasNext(contentItems: OldContentItem[]): boolean {
  return firstIncomplete(contentItems) !== undefined;
}

export default function ModuleViewer({ contents, paNumber }: { contents: OldContentItem[], paNumber?: string }) {
  const flattenedContents = useMemo(() => FlattenContents(contents), []);
  const [content, setContent] = useState<OldContentItem>(firstIncompleteOrDefault(flattenedContents));
  const [scope, animate] = useAnimate();
  const [hasNext, setHasNext] = useState(nasNext(flattenedContents));

  function nextItem() {
    setContent(nextIncompleteOrDefault(flattenedContents, content));
  }

  useEffect(() => {
    const completionStatus = content?.state.completionStatus;
    if (scope.current === undefined) {
      return;
    }

    if (completionStatus === CompletionStatus.Completed) {
      animate(scope.current, { marginBottom: "0px" });
      setHasNext(nasNext(flattenedContents));
      return;
    } else {
      animate(scope.current, { marginBottom: "-100px" });
    }

    const observer = content?.state.completionStatusObservable.subscribe((s) => {
      if (s === CompletionStatus.Completed) {
        animate(scope.current, { marginBottom: "0px" });
        setHasNext(nasNext(flattenedContents));
      }
    });

    return () => observer?.unsubscribe();
  }, [content]);
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
      <Box sx={{ overflowY: "auto" }}>
        <List component="nav">
          {contents.map((c) => (
            <ContentMenuItem
              key={c.metadata.id}
              contentItem={c}
              isSelected={(c) => c === content}
              setContent={setContent}
            />
          ))}
        </List>
      </Box>
      <Divider orientation="vertical" sx={{ gridColumn: "2" }} />
      <Box id="context-box" sx={{ width: "100%", display: "grid", gridTemplateRows: "1fr auto", overflow: "hidden" }}>
        <div style={{ height: '100%', gridArea: "1 / 1", display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{flex: 1}}
          >
            <ContentViewer content={content} />
          </Box>
          <Box sx={{ textAlign: "center", flexShrink: 0}}>
            {paNumber}
          </Box>
        </div>

        <Box
          component={motion.div}
          ref={scope}
          sx={{
            gridArea: "2",
          }}
        >
          <Box sx={{ alignItems: "center", margin: "5px", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <ContentNavigationComponent hasNext={hasNext} nextItem={nextItem} contentName={content?.metadata.name} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function ContentNavigationComponent({
  hasNext,
  nextItem,
  contentName,
}: {
  hasNext: boolean;
  nextItem: () => void;
  contentName?: string;
}) {
  const navigate = useNavigate();

  function toDashboard() {
    navigate({ to: "/dashboard" });
  }

  if (hasNext) {
    return (
      <>
        <Typography variant="h6">{contentName} Complete</Typography>
        <Button sx={{ width: "10em", justifySelf: "end" }} variant="contained" onClick={nextItem}>
          Next
        </Button>
      </>
    );
  }

  return (
    <>
      <Typography variant="h6">Module Complete</Typography>
      <Button sx={{ width: "10em", justifySelf: "end" }} variant="contained" onClick={toDashboard}>
        Dashboard
      </Button>
    </>
  );
}
