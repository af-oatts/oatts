import { CompletionStatus, ScormModel } from "@/core/model/ScormModel";
import { ContentState, ContentStateType, CompletionStatus as InternalCompletionStatus } from "@/core/model/OattsModel";
import { Status } from "../model/Status";

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

/**
 * @deprecated The method should not be used
 * TODO: DELETE ME!
 */
export function internalizeScormState(model: ScormModel): ContentStateType {
  const completionStatus = internalizeCompletionStatus(model.cmi.completion_status);
  const contentStateType: ContentStateType = {
    completionStatus,
  };

  return contentStateType;
}


export function ScormStateToStatus(scormModel: ScormModel): Status {
  const completionStatus = internalizeCompletionStatus(scormModel.cmi.completion_status);
  return { completionStatus };
}