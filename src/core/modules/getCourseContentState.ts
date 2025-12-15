import { CourseContent, CourseContentItemType, CompletionStatus } from "@/core/model/OattsModel";
import User from "@/core/model/UserModel";
import { loadModel } from "../scorm/ScormHelper";
import { internalizeCompletionStatus } from "../scorm/ScormInternalizer";
import { GetContentState } from "../database/Content";


export async function getCourseContentState(user: User, content: CourseContent | CourseContent) {
  let internalState = await GetContentState(user, content.id);

  if (content.type === CourseContentItemType.SCORM) {
    const stateModel = await loadModel(user, content.id);
    if (internalState != undefined) {
      internalState!.completionStatus = internalizeCompletionStatus(stateModel.cmi.completion_status);
    }
  }
  return internalState ?? { completionStatus: CompletionStatus.NotStarted, contentID: content.id };
}
