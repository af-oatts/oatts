import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import { CompletionStatus } from "@/core/model/OattsModel";
import { motion } from "motion/react";

export function ContentCompletionIndicator({ completion }: { completion: CompletionStatus }) {
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
    default:
      return <></>;
  }
}
