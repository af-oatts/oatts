import { CompletionStatus, CourseContent, Course } from "@/core/model/OattsModel";
import { OATTS_ROOT } from "../utils/Globals";

export function calculateCourseCompletionStatus(course: Course): CompletionStatus {
  return calculateMultiContentCompletionStatus(course.contents);
}

export function calculateMultiContentCompletionStatus(contents: CourseContent[]): CompletionStatus {
  let statuses = contents.map(CalculateContentCompletionStatus);
  return ReduceCompletionStatus(statuses);
}

export function checkIfRequirementsAreComplete(courses: Course[]): boolean {
  return courses.every((course) => calculateCourseCompletionStatus(course) === CompletionStatus.Completed);
}

export function CalculateContentCompletionStatus(content: CourseContent): CompletionStatus {
  if (Array.isArray(content.children)) {
    let completionStatuses = content.children.map(CalculateContentCompletionStatus);
    return ReduceCompletionStatus(completionStatuses);
  }

  return content.state.completionStatus;
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

export function CalculateCoursesProgress(modules: Course[]): number {
  return (
    modules.map((m) => CalculateCourseProgress(m)).reduce((accumulator, val) => accumulator + val, 0) / modules.length
  );
}

function CalculateCourseProgress(course: Course): number {
  const statuses = course.contents.flatMap(FlattenContentStatuses);
  const total = statuses.length;
  const completed = statuses.filter((s) => s === CompletionStatus.Completed).length;
  const inProgress = statuses.filter((s) => s === CompletionStatus.Started).length;

  return (completed + inProgress * 0.5) / total;
}

function FlattenContentStatuses(content: CourseContent): CompletionStatus[] {
  const contents = FlattenContentItem(content);

  const statuses = contents.map((c) => c.state.completionStatus);

  return statuses;
}

export function FlattenContents(contents: CourseContent[]): CourseContent[] {
  const flattenedContents = contents.flatMap(FlattenContentItem);
  return flattenedContents;
}

export function GetContentURL(content: CourseContent) {
  return `${OATTS_ROOT}/content/${content.id}/${content.entrypoint}`
}
function FlattenContentItem(content: CourseContent): CourseContent[] {
  if (Array.isArray(content.children)) {
    return content.children.flatMap(FlattenContentItem);
  }

  return [content];
}

