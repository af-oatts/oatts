import { ContentState, ContentStateType, createDefaultContentState } from "@/core/model/OattsModel";
import User from "@/core/model/UserModel";
import loadDatabase from "./DatabaseLoader";
import { CompletionStatus, ScormDbEntity, ScormModel } from "@/core/model/ScormModel";

type DbContentState = {
  userId: string;
  contentId: string;
  data: string;
};

export async function GetContentState(user: User, id: string): Promise<ContentState | undefined> {
  let db = await loadDatabase();
  let states = await db.select<DbContentState[]>(
    `
    SELECT userContentState.* FROM userContentState
    INNER JOIN users ON users.id = userContentState.userId
    WHERE users.email = $2 AND userContentState.contentUri = $1
    `,
    [id, user.email],
  );

  let dbState = states.at(0);
  if (dbState === undefined) {
    return undefined;
  }
  let state: ContentStateType = JSON.parse(dbState.data);
  let contentState = createDefaultContentState(id);
  internalizeContentState(state, contentState);
  return contentState;
}

export function internalizeContentState(stateType: ContentStateType, contentState: ContentState) {
  contentState.completionStatus = stateType.completionStatus; // Does this line run?
}

export function externalizeContentState(state: ContentState): ContentStateType {
  return {
    completionStatus: state.completionStatus,
  };
}

export async function saveScormModel(user: User, contentUri: string, model: ScormModel) {
  const db = await loadDatabase();
  return await db.execute(
    `
    INSERT OR REPLACE INTO scorm (userId, contentUri, data)
    SELECT users.id, $1, $2
    FROM users
    WHERE users.email = $3
    `,
    [contentUri, JSON.stringify(model), user.email],
  );
}

export async function loadScormModel(userId: string, contentUri: string) {
  const db = await loadDatabase();
  const results = await db.select<ScormDbEntity[]>("SELECT * from scorm where userId = $1 and contentUri = $2;", [
    userId,
    contentUri,
  ]);
  if (results.length === 0) return undefined;
  return JSON.parse(results[0].data) as ScormModel;
}

export async function getUserId(user: User) {
  const db = await loadDatabase();
  const dbUser = await db.select<[{ id: string }]>("SELECT id from users where email = $1", [user.email]);
  return dbUser[0]?.id;
}

export async function saveContentStateType(user: User, id: string, state: ContentStateType) {
  let db = await loadDatabase();
  await db.execute(
    `
    INSERT OR REPLACE INTO userContentState (userId, contentUri, data)
    SELECT users.id, $1, $2
    FROM users
    WHERE users.email = $3
  `,
    [id, JSON.stringify(state), user.email],
  );
}

export function resetUserContentState(user: User, contentUri: string) {
  return loadDatabase().then((db) =>
    db.execute(
      `UPDATE userContentState SET data = $3, numRestarts = numRestarts + 1 WHERE userId = (SELECT id FROM users WHERE email = $1) AND contentUri LIKE $2`,
      [user.email, `${contentUri}%`, JSON.stringify({ completionStatus: CompletionStatus.Unknown })],
    ),
  );
}

export function deleteUserScorm(user: User, contentUri: string) {
  return loadDatabase().then((db) =>
    db.execute(`DELETE FROM scorm WHERE userId = (SELECT id FROM users WHERE email = $1) AND contentUri LIKE $2`, [
      user.email,
      `${contentUri}%`,
    ]),
  );
}

