import { ScormModel } from "./ScormModel";
import { Duration } from "dayjs/plugin/duration";
// TODO: This is the only spot we use rxjs. Can we remove it?
import { Subject } from "rxjs";

// The learning module with one or more content items
export type Module = {
  id: string;
  name: string;
  description: string;
  previewImage?: string;
  paNumber?: string;
  timeToComplete? : number;
  roles: Role[];
  contents: ContentItem[];
};

export type ContentItem = {
  metadata: ContentMetadata;
  type: ContentType;
  workingDir: string;
  content?: string;
  subContents?: ContentItem[];
  // ideally we'd just have the ContentState instead of both, but for now we can just have both and slowly
  // move scorm stuff to our internal state
  scormState?: ScormModel;
  state: ContentState;
};

export type ContentMetadata = {
  id: string;
  name: string;
  description?: string;
  duration?: Duration;
};

export type QuizName = {
  name: string;
};
export type PreQuiz = QuizName;
export type PostQuiz = QuizName;

// Basic config values for OATTS. Can be parsed from yaml
export type OattsConfig = {
  modules: ManifestMetadata[];
  preQuiz?: ManifestMetadata;
  postQuiz?: ManifestMetadata;
  versionNumber?: string;
  allowDataCollection?: boolean;
  roles: Role[];
};

export type PostQuizConfig = {
  content: ManifestMetadata[];
};

export type PostQuizModule = {
  postQuizzes: PostQuizContent[];
}

export type PostQuizContent = {
  roleIds: string[];
  content: ContentItem;
};

export type QuizContent = {
  content: ContentItem;
  roles: Role[];
};

export type ManifestMetadata = {
  name: string;
};

export enum ContentType {
  CONTAINER = "CONTAINER",
  MODULE = "MODULE",
  ROOT = "ROOT",
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
