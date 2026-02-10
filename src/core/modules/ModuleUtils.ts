import { CompletionStatus, Course, CourseContent } from "@/core/model/OattsModel";
import { OATTS_ROOT } from "../utils/Globals";
import { ContentStateMap } from "@/contexts/models/ContentStateMap";

export function checkIfRequirementsAreComplete(courses: Course[], states: ContentStateMap): boolean {
  return courses.every((course) =>
    course.contents.every((x) => states[x.id]?.completionStatus === CompletionStatus.Completed),
  );
}

export function ReduceCompletionStatus(statuses: CompletionStatus[]): CompletionStatus {
  if (statuses.every((stat) => stat === CompletionStatus.Completed)) {
    return CompletionStatus.Completed;
  }

  if (statuses.some((stat) => stat === CompletionStatus.Started || stat === CompletionStatus.Completed)) {
    return CompletionStatus.Started;
  }

  return CompletionStatus.NotStarted;
}

export function CompletionStatusToString(status: CompletionStatus): string {
  switch (status) {
    case CompletionStatus.Unknown:
      return "Unknown";
    case CompletionStatus.Completed:
      return "Completed";
    case CompletionStatus.NotStarted:
      return "Not Started";
    case CompletionStatus.Started:
      return "In Progress";
    default:
      return "Unknown";
  }
}

export function calculateCoursesProgress(modules: Course[], states: ContentStateMap | undefined): number {
  return (
    modules.map((m) => calculateCourseProgress(m, states)).reduce((accumulator, val) => accumulator + val, 0) /
    modules.length
  );
}

function calculateCourseProgress(course: Course, states: ContentStateMap | undefined): number {
  if (!states) return 0;
  const contents = course.contents.flatMap(FlattenContentItem);
  const total = contents.length;
  const completed = contents.filter((x) => states[x.id].completionStatus === CompletionStatus.Completed).length;
  const inProgress = contents.filter((x) => states[x.id].completionStatus === CompletionStatus.Started).length;

  return (completed + inProgress * 0.5) / total;
}

export function FlattenContents(contents: CourseContent[]): CourseContent[] {
  const flattenedContents = contents.flatMap(FlattenContentItem);
  return flattenedContents;
}

function FlattenContentItem(content: CourseContent): CourseContent[] {
  if (Array.isArray(content.children)) {
    return content.children.flatMap(FlattenContentItem);
  }

  return [content];
}

export function GetContentURL(content: CourseContent) {
  return `${OATTS_ROOT}/content/${content.id}/${content.entrypoint}`;
}

export function GetCourseImageURL(course: Course) {
  return `${OATTS_ROOT}/assets/${course.img}`;
}
