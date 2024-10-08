import { LoadScormMetadata } from "./ScormHelper";
import { ScormMetadata } from "@/core/model/ScormMetadata";
import { ContentItem, ContentType } from "@/core/model/OattsModel";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

// Populates any info we might care about in our model from SCORM metadata if it exists.
export async function PopulateInfoFromScorm(content: ContentItem) {
  if (content.type === ContentType.CONTAINER && content.subContents !== undefined) {
    for (const subContent of content.subContents) {
      PopulateInfoFromScorm(subContent);
    }
    return;
  }
  const metadata = await LoadScormMetadata(content.workingDir);
  if (metadata === undefined) {
    return;
  }
  PopulateId(metadata, content);
  PopulateDuration(metadata, content);
}

function PopulateId(metadata: ScormMetadata, content: ContentItem) {
  const newId = metadata.general?.identifier?.entry;
  if (newId === undefined)
    return;

  content.metadata.id = newId;
}

function PopulateDuration(metadata: ScormMetadata, content: ContentItem) {
  const stringDuration = metadata.educational?.typicalLearningTime.duration;
  if (stringDuration === undefined) {
    return;
  }
  const dur = dayjs.duration(stringDuration);
  content.metadata.duration = dur;
}