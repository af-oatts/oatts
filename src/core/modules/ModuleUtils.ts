import { CompletionStatus, ContentItem, Module } from "@/core/model/OattsModel";
import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";

export function CalculateEstimatedDuration(module: Module): Duration {
  let duration = module.contents.map(CalculateContentDuration).reduce((prev, curr) => prev.add(curr));
  return duration;
}

function CalculateContentDuration(content: ContentItem): Duration {
  if (Array.isArray(content.subContents)) {
    let subContentsDuration = content.subContents.map(CalculateContentDuration);
    return subContentsDuration.reduce((prev, curr) => prev.add(curr));
  }

  return content.metadata.duration ?? dayjs.duration(0);
}

export function calculateModuleCompletionStatus(module: Module): CompletionStatus {
  return calculateMultiContentCompletionStatus(module.contents);
}

export function calculateMultiContentCompletionStatus(contents: ContentItem[]): CompletionStatus {
  let statuses = contents.map(CalculateContentCompletionStatus);
  return ReduceCompletionStatus(statuses);
}

export function checkIfRequirementsAreComplete(modules: Module[]): boolean {
  return modules.every((module) => calculateModuleCompletionStatus(module) === CompletionStatus.Completed);
}

export function CalculateContentCompletionStatus(content: ContentItem): CompletionStatus {
  if (Array.isArray(content.subContents)) {
    let completionStatuses = content.subContents.map(CalculateContentCompletionStatus);
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

export function CalculateModulesProgress(modules: Module[]): number {
  return (
    modules.map((m) => CalculateModuleProgress(m)).reduce((accumulator, val) => accumulator + val, 0) / modules.length
  );
}

function CalculateModuleProgress(module: Module): number {
  const statuses = module.contents.flatMap(FlattenContentStatuses);
  const total = statuses.length;
  const completed = statuses.filter((s) => s === CompletionStatus.Completed).length;
  const inProgress = statuses.filter((s) => s === CompletionStatus.Started).length;

  return (completed + inProgress * 0.5) / total;
}

function FlattenContentStatuses(content: ContentItem): CompletionStatus[] {
  const contents = FlattenContentItem(content);

  const statuses = contents.map((c) => c.state.completionStatus);

  return statuses;
}

export function FlattenContents(contents: ContentItem[]): ContentItem[] {
  const flattenedContents = contents.flatMap(FlattenContentItem);
  return flattenedContents;
}

function FlattenContentItem(content: ContentItem): ContentItem[] {
  if (Array.isArray(content.subContents)) {
    return content.subContents.flatMap(FlattenContentItem);
  }

  return [content];
}
