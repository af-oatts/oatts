import { ScormModel } from "./ScormModel";
// TODO: This is the only spot we use rxjs. Can we remove it?
import { Subject } from "rxjs";



export type OattsManifest = {
  courses: StatelessCourse[];
  prequizzes?: StatelessCourse[];
  postquizzes?: StatelessCourse[];
  versionNumber?: string;
  allowDataCollection?: boolean;
  roles: Role[];
};

export type Course = {
  id: string,
  name: string,
  roleIds: string[],
  contents: CourseContent[],
  img?: string,
  description?: string,
  paNumber?: string,
  timeToComplete?: number,
}


export type CourseContent = {
  id: string,
  name: string,
  type: CourseContentItemType,
  entrypoint?: string,
  description?: string,
  children?: CourseContent[]
  // ideally we'd just have the ContentState instead of both, but for now we can just have both and slowly
  // move scorm stuff to our internal state
  scormState?: ScormModel;
  state: ContentState;
}







export type StatelessCourse = {
  id: string,
  name: string,
  roleIds: string[],
  contents: StatelessCourseContent[],
  img?: string,
  description?: string,
  paNumber?: string,
  timeToComplete?: number,
}


export type StatelessCourseContent = {
  id: string,
  name: string,
  type: CourseContentItemType,
  entrypoint?: string,
  description?: string,
  children?: StatelessCourseContent[]
}

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





// Holds anything about a module that might change over time
// Unlike module metadata, for example, the state is meant to change throughout the module's lifecycle.
// Like the completion status, that is not really information about the module, but it does indicate
// what state the module is in for a given user
export type ContentStateType = {
  completionStatus: CompletionStatus;
};

export enum CompletionStatus {
  Unknown,
  NotStarted,
  Started,
  Completed,
}

export class ContentState {
  private _completionStatus: CompletionStatus = CompletionStatus.NotStarted;
  private _completionStatusSubject = new Subject<CompletionStatus>();

  set completionStatus(status: CompletionStatus) {
    this._completionStatus = status;
    this._completionStatusSubject.next(status);
  }

  get completionStatus() {
    return this._completionStatus;
  }

  get completionStatusObservable() {
    return this._completionStatusSubject.asObservable();
  }
}

export class GenericResult {
  constructor(success: boolean = true, message: string | undefined = undefined) {
    this.success = success;
    this.message = message;
  }

  success: boolean;
  message: string | undefined;
}
