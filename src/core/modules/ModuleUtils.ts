import { CompletionStatus, OldContentItem, OldModule } from "@/core/model/OattsModel";
import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";

export function CalculateEstimatedDuration(module: OldModule): Duration {
  let duration = module.contents.map(CalculateContentDuration).reduce((prev, curr) => prev.add(curr));
  return duration;
}

function CalculateContentDuration(content: OldContentItem): Duration {
  if (Array.isArray(content.subContents)) {
    let subContentsDuration = content.subContents.map(CalculateContentDuration);
    return subContentsDuration.reduce((prev, curr) => prev.add(curr));
  }

  return content.metadata.duration ?? dayjs.duration(0);
}

export function calculateModuleCompletionStatus(module: OldModule): CompletionStatus {
  return calculateMultiContentCompletionStatus(module.contents);
}

export function calculateMultiContentCompletionStatus(contents: OldContentItem[]): CompletionStatus {
  let statuses = contents.map(CalculateContentCompletionStatus);
  return ReduceCompletionStatus(statuses);
}

export function checkIfRequirementsAreComplete(modules: OldModule[]): boolean {
  return modules.every((module) => calculateModuleCompletionStatus(module) === CompletionStatus.Completed);
}

export function CalculateContentCompletionStatus(content: OldContentItem): CompletionStatus {
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

export function CalculateModulesProgress(modules: OldModule[]): number {
  return (
    modules.map((m) => CalculateModuleProgress(m)).reduce((accumulator, val) => accumulator + val, 0) / modules.length
  );
}

function CalculateModuleProgress(module: OldModule): number {
  const statuses = module.contents.flatMap(FlattenContentStatuses);
  const total = statuses.length;
  const completed = statuses.filter((s) => s === CompletionStatus.Completed).length;
  const inProgress = statuses.filter((s) => s === CompletionStatus.Started).length;

  return (completed + inProgress * 0.5) / total;
}

function FlattenContentStatuses(content: OldContentItem): CompletionStatus[] {
  const contents = FlattenContentItem(content);

  const statuses = contents.map((c) => c.state.completionStatus);

  return statuses;
}

export function FlattenContents(contents: OldContentItem[]): OldContentItem[] {
  const flattenedContents = contents.flatMap(FlattenContentItem);
  return flattenedContents;
}

function FlattenContentItem(content: OldContentItem): OldContentItem[] {
  if (Array.isArray(content.subContents)) {
    return content.subContents.flatMap(FlattenContentItem);
  }

  return [content];
}
