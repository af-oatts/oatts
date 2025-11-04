// import { CompletionStatus, ContentState, CourseContent, StatelessCourseContent } from "@/core/model/OattsModel";
// import { Box, Button, Divider, List, Typography } from "@mui/material";
// import { motion, useAnimate } from "motion/react";
// import { useEffect, useMemo, useState } from "react";
// import ContentViewer from "./ContentViewer";
// import { FlattenContents } from "../../core/modules/ModuleUtils";
// import { useNavigate } from "@tanstack/react-router";
// import { ContentMenuItem } from "@/components/common/ContentMenu";
// import { useCourseContentStates } from "@/contexts/hooks/useCourseContentState";
// import { BigLoadingScreen } from "../common/BigLoadingScreen";
// import { getFirstIncompleteContentId } from "./GetFirstIncompleteContentId";

// function doWeHaveNext(states: ContentState[]): boolean {
//   return getFirstIncompleteContentId(states) !== undefined;
// }

// export default function CourseViewer({
//   contents,
//   paNumber,
//   onEverythingCompleted,
// }: {
//   contents: StatelessCourseContent[];
//   paNumber?: string;
//   onEverythingCompleted?: () => void;
// }) {
//   const flattenedContents = useMemo(() => FlattenContents(contents), []);
//   const { states, isLoading } = useCourseContentStates(flattenedContents.map((c) => c.id));

//   // TODO: It would probably be better to have a single object that holds contents AND state. A lot of edge cases would be resolved if we do that.
//   const [content, setContent] = useState<StatelessCourseContent | undefined>(undefined);
//   const [state, setState] = useState<ContentState | undefined>(undefined);
//   const [scope, animate] = useAnimate();
//   const [hasNext, setHasNext] = useState(false);

//   // Loads the next incomplete item or defaults to the first item.
//   function loadNext() {
//     if (states.length < 1) {
//       console.error(
//         "Attempted to load next incomplete or default content, but states array is empty! This could be because states haven't loaded yet or because there are no contents in this module.",
//       );
//     }
//     let id = getFirstIncompleteContentId(states) ?? states[0].contentID;
//     switchTo(id);
//   }

//   function switchTo(id: string) {
//     const newContent = contents.find((c) => c.id === id);
//     const newState = states.find((s) => s.contentID == id);
//     if (!newContent || newState) {
//       console.error("Content of id " + id + " does not exist in provided contents or states.");
//       return;
//     }

//     setContent(newContent);
//     setState(newState);
//   }

//   useEffect(() => {
//     if (isLoading) return;

//     if (!state || !content) {
//       loadNext(); // Load the most recent incomplete or default content item.
//     }

//     setHasNext(doWeHaveNext(states));

//     if (state && state.completionStatus === CompletionStatus.Completed) {
//       if (scope.current == undefined) {
//         console.error("User completed course but next button is undefined and thus cannot be revealed.");
//         return;
//       }

//       animate(scope.current, { marginBottom: "0px" });
//       return;
//     } else {
//       if (scope.current == undefined) return;
//       animate(scope.current, { marginBottom: "-100px" });
//     }
//   }, [isLoading, states]);

//   if (isLoading || !content || !state) {
//     return <BigLoadingScreen />;
//   }

//   return (
//     <Box
//       layout
//       id="module-viewer"
//       component={motion.div}
//       sx={(theme) => ({
//         height: "100%",
//         flex: "auto",
//         width: "100%",
//         display: "grid",
//         overflow: "hidden",
//         gridTemplateColumns: "1fr auto 3fr",
//         background: theme.palette.background.gradient,
//       })}
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } }}
//     >
//       <Box sx={{ overflowY: "auto" }}>
//         <List component="nav">
//           {contents.map((c) => (
//             <ContentMenuItem
//               key={c.id}
//               state={states.find((s) => s.contentID === c.id)}
//               contentItem={c}
//               isSelected={(id) => id === content.id}
//               setContent={switchTo}
//             />
//           ))}
//         </List>
//       </Box>
//       <Divider orientation="vertical" sx={{ gridColumn: "2" }} />
//       <Box id="context-box" sx={{ width: "100%", display: "grid", gridTemplateRows: "1fr auto", overflow: "hidden" }}>
//         <div style={{ height: "100%", gridArea: "1 / 1", display: "flex", flexDirection: "column" }}>
//           <Box sx={{ flex: 1 }}>
//             <ContentViewer content={content} state={state} />
//           </Box>
//           <Box sx={{ textAlign: "center", flexShrink: 0 }}>{paNumber}</Box>
//         </div>

//         <Box
//           component={motion.div}
//           ref={scope}
//           sx={{
//             gridArea: "2",
//           }}
//         >
//           <Box sx={{ alignItems: "center", margin: "5px", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
//             <ContentNavigationComponent hasNext={hasNext} nextItem={loadNext} contentName={content?.name} />
//           </Box>
//         </Box>
//       </Box>
//     </Box>
//   );
// }

// function ContentNavigationComponent({
//   hasNext,
//   nextItem,
//   contentName,
// }: {
//   hasNext: boolean;
//   nextItem: () => void;
//   contentName?: string;
// }) {
//   const navigate = useNavigate();

//   function toDashboard() {
//     navigate({ to: "/dashboard" });
//   }

//   if (hasNext) {
//     return (
//       <>
//         <Typography variant="h6">{contentName} Complete</Typography>
//         <Button sx={{ width: "10em", justifySelf: "end" }} variant="contained" onClick={nextItem}>
//           Next
//         </Button>
//       </>
//     );
//   }

//   return (
//     <>
//       <Typography variant="h6">Module Complete</Typography>
//       <Button sx={{ width: "10em", justifySelf: "end" }} variant="contained" onClick={toDashboard}>
//         Dashboard
//       </Button>
//     </>
//   );
// }
