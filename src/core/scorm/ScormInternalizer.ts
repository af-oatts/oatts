import { CompletionStatus, ScormModel } from "@/core/model/ScormModel";
import { ContentStateType, CompletionStatus as InternalCompletionStatus } from "@/core/model/OattsModel";

export function internalizeCompletionStatus(completionStatus: CompletionStatus): InternalCompletionStatus {
  switch (completionStatus) {
    case CompletionStatus.Unknown:
      return InternalCompletionStatus.NotStarted;
    case CompletionStatus.NotAttempted:
      return InternalCompletionStatus.NotStarted;
    case CompletionStatus.Completed:
      return InternalCompletionStatus.Completed;
    case CompletionStatus.Incomplete:
      return InternalCompletionStatus.Started;
    default:
      return InternalCompletionStatus.NotStarted;
  }
}

export function internalizeScormState(model: ScormModel): ContentStateType {
  const completionStatus = internalizeCompletionStatus(model.cmi.completion_status);
  const contentStateType: ContentStateType = {
    completionStatus,
  };

  return contentStateType;
}
