import {
  CompletionStatus,
  Credit,
  Entry,
  Exit,
  Mode,
  ScormModel,
  SuccessStatus,
  TimeLimitAction,
} from "@/core/model/ScormModel";
import User from "@/core/model/UserModel";
import { join } from "@tauri-apps/api/path";
import { FetchFile } from "@/core/utils/FileHelper";
import { ScormMetadata } from "@/core/model/ScormMetadata";
import { ParserOptions, parseStringPromise } from "xml2js";
import { internalizeScormState } from "./ScormInternalizer";
import {
  getUserId,
  loadScormModel,
  saveContentStateType,
  saveScormModel,
} from "../database/Content";

export function createModel({ user }: { user: User | undefined }): ScormModel {
  const userName = user?.firstName ?? "";
  return {
    cmi: {
      _version: "2004v4",
      comments_from_learner: {
        _count: 0,
        _children: [],
      },
      comments_from_lms: {
        _count: 0,
        _children: [],
      },
      completion_status: CompletionStatus.Unknown,
      completion_threshold: 0,
      credit: Credit.Credit,
      entry: Entry.AbInitio,
      exit: Exit.Unknown,
      interactions: {
        _count: 0,
        _children: [],
      },
      launch_data: "",
      learner_id: "",
      learner_name: userName,
      learner_preference: {
        _children: [],
        audio_level: 0,
        language: "en-us",
        delivery_speed: 0,
        audio_captioning: "0",
      },
      location: "",
      max_time_allowed: "",
      mode: Mode.Normal,
      objectives: {
        _children: [],
        _count: 0,
      },
      progress_measure: 0,
      scaled_passing_score: 1,
      score: {
        scaled: 0,
        raw: 0,
        min: 0,
        max: 0,
      },
      session_time: "",
      success_status: SuccessStatus.Unknown,
      suspend_data: "",
      time_limit_action: TimeLimitAction.ExitNoMessage,
      total_time: "",
    },
  };
}

function setValueHelper(model: any, keys: string[], value: any) {
  let key = keys[0];
  // we have reached the leaf and can safely set the value of the item.
  if (keys.length === 1) {
    model[key] = value;
    return;
  }

  // If the current key is numeric, that means we are currently on an object that follows the {_children, _count} data format
  // basically a collection of things
  if (isNumeric(key)) {
    let idx = parseInt(key);
    if (model._children === undefined) {
      model._children = [];
      model._count = 0;
    }
    let existingItem = model._children[idx];
    if (existingItem === undefined) {
      existingItem = {};
      model._children[idx] = existingItem;
      model._count++;
    }

    setValueHelper(existingItem, keys.slice(1), value);
  } else {
    if (model[key] === undefined) {
      model[key] = {};
    }
    setValueHelper(model[key], keys.slice(1), value);
  }
}

function getValueHelper(model: any, keys: string[]) {
  let key = keys[0];
  // we have reached the leaf and can safely return the value of the item.
  if (keys.length === 1) {
    return model[key];
  }

  // If the current key is numeric, that means we are currently on an object that follows the {_children, _count} data format
  // basically a collection of things
  if (isNumeric(key)) {
    let idx = parseInt(key);
    let existingItem = model._children[idx];
    return getValueHelper(existingItem, keys.slice(1));
  } else {
    return getValueHelper(model[key], keys.slice(1));
  }
}

export async function Commit(model: ScormModel, contentUri: string, user: User) {
  const internalState = internalizeScormState(model);
  return await Promise.all([
    saveScormModel(user, contentUri, model),
    saveContentStateType(user, contentUri, internalState),
  ]);
}





export async function loadModel(user: User, contentUri: string): Promise<ScormModel> {
  const userId = await getUserId(user);
  const scormModel = await loadScormModel(userId, contentUri);
  if (!scormModel) {
    return createModel({ user });
  }
  return scormModel;
}

export async function LoadScormMetadata(modFullWorkDir: string): Promise<ScormMetadata | undefined> {
  let path = await join(modFullWorkDir, "metadata.xml");
  let scormMetadataString = await FetchFile(path, "text/xml");
  if (scormMetadataString === undefined) {
    return undefined;
  }

  let opts: ParserOptions = {
    explicitRoot: false,
    explicitArray: false,
    mergeAttrs: true,
  };
  let parsedResult = await parseStringPromise(scormMetadataString, opts);
  let metadata = parsedResult as ScormMetadata;
  return metadata;
}

export function setValue(model: ScormModel, key: string, value: any) {
  let individualKeys = key.split(".");
  setValueHelper(model, individualKeys, value);
}

export function getValue(model: ScormModel, key: string) {
  let individualKeys = key.split(".");
  return getValueHelper(model, individualKeys);
}

function isNumeric(str: string) {
  return !isNaN(parseFloat(str));
}
