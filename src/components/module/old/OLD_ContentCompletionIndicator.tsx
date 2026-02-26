import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import WarningIcon from "@mui/icons-material/Warning";
import { CompletionStatus } from "@/core/model/OattsModel";
import { motion } from "motion/react";

export function OLD_ContentCompletionIndicator({ completion }: { completion: CompletionStatus | undefined }) {
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
      return <WarningIcon
        component={motion.svg}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={(theme) => ({ color: theme.palette.progress.inProgress })}
      />
  }
}
