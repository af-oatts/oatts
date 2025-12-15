export type OattsManifest = {
  courses: Course[];
  prequizzes?: Course[];
  postquizzes?: Course[];
  versionNumber?: string;
  allowDataCollection?: boolean;
  roles: Role[];
  goals?: Goal[];
};

export type Course = {
  id: string;
  name: string;
  roleIds: string[];
  contents: CourseContent[];
  img?: string;
  description?: string;
  paNumber?: string;
  timeToComplete?: number;
};

export type CourseContent = {
  id: string;
  name: string;
  type: CourseContentItemType;
  entrypoint?: string;
  description?: string;
  children?: CourseContent[];
};

// Represents the types a course's contents can be.
export enum CourseContentItemType {
  SUBMODULE = "SUBMODULE",
  SCORM = "SCORM",
  PDF = "PDF",
  HTML = "HTML",
  UNKNOWN = "UNKNOWN",
}

export type Role = {
  id: string;
  name: string;
  general: boolean;
};

export type Goal = {
  id: string;
  name: string;
  roleIDs: string[]
}

// Holds anything about a module that might change over time
// Unlike module metadata, for example, the state is meant to change throughout the module's lifecycle.
// Like the completion status, that is not really information about the module, but it does indicate
// what state the module is in for a given user
export type ContentStateType = {
  completionStatus: CompletionStatus;
};
export type ContentState = {
  contentID: string;
  completionStatus: CompletionStatus;
};

export enum CompletionStatus {
  Unknown = 0,
  NotStarted = 1,
  Started = 2,
  Completed = 3,
}

export class GenericResult {
  constructor(success: boolean = true, message: string | undefined = undefined) {
    this.success = success;
    this.message = message;
  }

  success: boolean;
  message: string | undefined;
}

export function createDefaultContentState(id: string): ContentState {
  return {
    contentID: id,
    completionStatus: CompletionStatus.NotStarted,
  };
}
