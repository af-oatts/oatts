
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { ScormModel } from "@/core/model/ScormModel";
import { Commit, getValue, setValue } from "./ScormHelper";
import User from "@/core/model/UserModel";
import { CourseContent } from "@/core/model/OattsModel";

export interface IScormApi {
  Initialize(): boolean;
  Terminate(): boolean;
  GetValue(key: string): string;
  SetValue(key: string, value: string): string;
  Commit(): boolean;
  GetLastError(): CMIErrorCode;
  GetErrorString(err: CMIErrorCode): string;
  GetDiagnostic(err: CMIErrorCode): string;
  SetModel(model: ScormModel): void;
  SetUser(user: User): void;
  SetContent(content: CourseContent): void;
  SetUpdateStateCallback(callback: (scormState: ScormModel) => void): void;
}

export class ScormApi implements IScormApi {
  private _model: ScormModel | undefined;
  private _user: User | undefined;
  private _content: CourseContent | undefined;
  private _latestCommit: NodeJS.Timeout | undefined;
  private _updateState = (_: ScormModel) => {
    console.warn(
      "SCORM Api has not been given a callback for updating state. State changes originating from SCORM will not be saved. Call `window.API_1484_11.SetUpdateCallback((state) => { /* Your callback here */});` to save content.",
    );
  };

  constructor() {}

  SetModel(model: ScormModel): void {
    this._model = model;
    console.log("My model has been set to", this._model);
  }

  SetUser(user: User): void {
    this._user = user;
  }

  SetContent(content: CourseContent): void {
    this._content = content;
  }

  Initialize(): boolean {
    return true;
  }

  Terminate(): boolean {
    return true;
  }

  GetValue(key: string): string {
    //console.log("GetValue was called", key);
    if (this._model === undefined) {
      return "";
    }
    let val = getValue(this._model, key);
    //console.log("Value returned", val);
    return val;
  }

  SetValue(key: string, value: string): string {
    console.log("SetValue was called", key, value);
    if (this._model === undefined) {
      return "";
    }
    setValue(this._model, key, value);
    //console.log(this._model);
    this.DelayedCommit(250);
    return value;
  }

  // Ideally, SCORM would call Commit() whenever something like completion_status changes so that the changes
  // could be committed to a persistent storage. However, that does not always seem to be the case, so we
  // just commit on every SetValue in order to maintain state and since this is a single user LMS, there shouldn't
  // be too many performance concerns. Even so, we ideally don't want to spam the database with like 8 commits at a time
  // so this delayed commit should ensure that bulk commits only get committed once.
  DelayedCommit(ms: number) {
    if (this._latestCommit !== undefined) {
      clearTimeout(this._latestCommit);
    }

    this._latestCommit = setTimeout(() => {
      this._latestCommit = undefined;
      this.DoCommit();
    }, ms);
  }

  Commit(): boolean {
    this.DelayedCommit(250);
    return true;
  }

  DoCommit(): boolean {
    if (this._model === undefined || this._content === undefined || this._user === undefined) {
      console.warn("Tried to commit with undefined vars");
      return false;
    }
    let uri = this._content.id;
    if (uri === undefined) {
      console.warn("Tried to commit without a set URI for the module");
      return false;
    }
    Commit(this._model, uri, this._user)
      .then(() => console.log("Commited to db"))
      .catch((e) => console.error("Problem commiting to db", e));

    this._updateState(this._model);
    return true;
  }

  GetLastError(): CMIErrorCode {
    //console.log("Get last error called");
    return CMIErrorCode.NoError;
  }

  GetErrorString(err: CMIErrorCode): string {
    //console.log("Get error string called", err);
    return getSCORMErrorDescription(err);
  }

  GetDiagnostic(err: CMIErrorCode): string {
    return getSCORMErrorDescription(err);
  }

  SetUpdateStateCallback(callback: (scormState: ScormModel) => void): void {
    this._updateState = callback;
  }
}

enum CMIErrorCode {
  NoError = 0,
  GeneralException = 101,
  GeneralInitializationFailure = 102,
  AlreadyInitialized = 103,
  ContentInstanceTerminated = 104,
  GeneralTerminationFailure = 111,
  TerminationBeforeInitialization = 112,
  TerminationAfterTermination = 113,
  RetrieveDataBeforeInitialization = 122,
  RetrieveDataAfterTermination = 123,
  StoreDataBeforeInitialization = 132,
  StoreDataAfterTermination = 133,
  CommitBeforeInitialization = 142,
  CommitAfterTermination = 143,
  GeneralArgumentError = 201,
  GeneralGetFailure = 301,
  GeneralSetFailure = 351,
  GeneralCommitFailure = 391,
  UndefinedDataModelElement = 401,
  UnimplementedDataModelElement = 402,
  DataModelElementValueNotInitialized = 403,
  DataModelElementIsReadOnly = 404,
  DataModelElementIsWriteOnly = 405,
  DataModelElementTypeMismatch = 406,
  DataModelElementValueOutOfRange = 407,
  DataModelDependencyNotEstablished = 408,
}

function getSCORMErrorDescription(errorCode: CMIErrorCode): string {
  switch (errorCode) {
    case CMIErrorCode.NoError:
      return "No error occurred, the previous API call was successful.";
    case CMIErrorCode.GeneralException:
      return "No specific error code exists to describe the error. Use GetDiagnostic for more information.";
    case CMIErrorCode.GeneralInitializationFailure:
      return "Call to Initialize failed for an unknown reason.";
    case CMIErrorCode.AlreadyInitialized:
      return "Call to Initialize failed because Initialize was already called.";
    case CMIErrorCode.ContentInstanceTerminated:
      return "Call to Initialize failed because Terminate was already called.";
    case CMIErrorCode.GeneralTerminationFailure:
      return "Call to Terminate failed for an unknown reason.";
    case CMIErrorCode.TerminationBeforeInitialization:
      return "Call to Terminate failed because it was made before the call to Initialize.";
    case CMIErrorCode.TerminationAfterTermination:
      return "Call to Terminate failed because Terminate was already called.";
    case CMIErrorCode.RetrieveDataBeforeInitialization:
      return "Call to GetValue failed because it was made before the call to Initialize.";
    case CMIErrorCode.RetrieveDataAfterTermination:
      return "Call to GetValue failed because it was made after the call to Terminate.";
    case CMIErrorCode.StoreDataBeforeInitialization:
      return "Call to SetValue failed because it was made before the call to Initialize.";
    case CMIErrorCode.StoreDataAfterTermination:
      return "Call to SetValue failed because it was made after the call to Terminate.";
    case CMIErrorCode.CommitBeforeInitialization:
      return "Call to Commit failed because it was made before the call to Initialize.";
    case CMIErrorCode.CommitAfterTermination:
      return "Call to Commit failed because it was made after the call to Terminate.";
    case CMIErrorCode.GeneralArgumentError:
      return "An invalid argument was passed to an API method.";
    case CMIErrorCode.GeneralGetFailure:
      return "Indicates a failed GetValue call where no other specific error code is applicable. Use GetDiagnostic for more information.";
    case CMIErrorCode.GeneralSetFailure:
      return "Indicates a failed SetValue call where no other specific error code is applicable. Use GetDiagnostic for more information.";
    case CMIErrorCode.GeneralCommitFailure:
      return "Indicates a failed Commit call where no other specific error code is applicable. Use GetDiagnostic for more information.";
    case CMIErrorCode.UndefinedDataModelElement:
      return "The data model element name passed to GetValue or SetValue is not a valid SCORM data model element.";
    case CMIErrorCode.UnimplementedDataModelElement:
      return "The data model element indicated in a call to GetValue or SetValue is valid, but was not implemented by this LMS.";
    case CMIErrorCode.DataModelElementValueNotInitialized:
      return "Attempt to read a data model element that has not been initialized by the LMS or through a SetValue call.";
    case CMIErrorCode.DataModelElementIsReadOnly:
      return "SetValue was called with a data model element that can only be read.";
    case CMIErrorCode.DataModelElementIsWriteOnly:
      return "GetValue was called on a data model element that can only be written to.";
    case CMIErrorCode.DataModelElementTypeMismatch:
      return "SetValue was called with a value that is not consistent with the data format of the supplied data model element.";
    case CMIErrorCode.DataModelElementValueOutOfRange:
      return "The numeric value supplied to a SetValue call is outside of the numeric range allowed for the supplied data model element.";
    case CMIErrorCode.DataModelDependencyNotEstablished:
      return "Some data model elements cannot be set until another data model element was set.";
    default:
      return "Unknown error code.";
  }
}
