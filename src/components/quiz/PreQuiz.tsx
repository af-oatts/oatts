// import { Box, Button, Typography } from "@mui/material";
// import { useEffect, useState } from "react";
// import { motion } from "motion/react";
// import { TransitionParams } from "../../theme/TransitionParams";
// import { CompletionStatus, CourseContent } from "@/core/model/OattsModel";
// import { useRouteContext } from "@tanstack/react-router";
// import { UserStatusFlag } from "@/core/model/UserModel";
// import { addUserStatusFlag } from "../../core/authentication/UserStatusFlag";
// import { useMultiCompletionStatus } from "../../core/modules/hooks/useMultiCompletionStatus";
// import CourseViewer from "../module/CourseView";
// import { LoadPreQuizzes } from "@/core/modules/ModuleLoader";
// import CourseView from "../module/CourseView";
// import { usePrequizController } from "../module/useCourseContentState";

// export default function PreQuizPage({ onNext }: { onNext: () => void }) {
//   const controller = usePrequizController();
//   let [quizzes, setQuizzes] = useState<CourseContent[] | undefined>(undefined);
//   let [quizExists, setQuizExists] = useState<boolean | undefined>(undefined);
//   let { user, oattsManifest } = useRouteContext({
//     from: "/_authenticated",
//     select: (ctx) => ({ user: ctx.authentication.user, oattsManifest: ctx.config }),
//   });
//   useEffect(() => {
//     let mounted = true;
//     if (user == undefined || oattsManifest == undefined || oattsManifest.prequizzes == undefined) {
//       return;
//     }
//     LoadPreQuizzes(user, oattsManifest).then((prequizzes) => {
//       setQuizzes(prequizzes);
//       setQuizExists(true);
//     });
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   useEffect(() => {
//     if (quizExists === false) onComplete();
//   }, [quizExists]);

//   let quizCompletionStatus = useMultiCompletionStatus(quizzes);

//   useEffect(() => {
//     if (quizCompletionStatus === CompletionStatus.Completed) {
//       onComplete();
//     }
//   }, [quizCompletionStatus]);

//   if (quizzes === undefined) {
//     return (
//       <>
//         <Box>Loading...</Box>
//       </>
//     );
//   }

//   if (!quizExists) {
//     return (
//       <>
//         <Box>A Pre Quiz has not been assigned</Box>
//       </>
//     );
//   }

//   async function onComplete() {
//     if (user === undefined) {
//       return;
//     }

//     await addUserStatusFlag(user, UserStatusFlag.PreQuizzed);
//     onNext();
//   }

//   return (
//     <>
//       <Box width="100%" height="100%">
//         <CourseView {...{ controller }} />
//       </Box>
//     </>
//   );
// }
