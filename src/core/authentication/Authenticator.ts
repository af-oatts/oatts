import User, { UserStatusFlag } from "@/core/model/UserModel";
import loadDatabase from "../database/DatabaseLoader";

export async function InsertUser(user: User) {
  const db = await loadDatabase();
  let result = await db.execute("INSERT into users (firstName, lastName, email, base) VALUES ($1, $2, $3, $4)", [
    user.firstName,
    user.lastName,
    user.email,
    user.base,
  ]);

  if (result.lastInsertId !== undefined) {
    user.id = result.lastInsertId;
  }

  return result;
}

export async function UserExists(email: string): Promise<boolean> {
  const db = await loadDatabase();
  let users = await db.select<any>("SELECT count(id) as numUsers from users WHERE users.email = $1", [email]);
  return users.length > 0 && users[0].numUsers > 0;
}

type DbUser = User & {
  status: UserStatusFlag;
  category: string;
};

function DbUsersToUsers(dbUsers: DbUser[]): User[] {
  const groupedResults = dbUsers.reduce<DbUser[]>((accumulator, current) => {
    const existingMainObject = accumulator.find((item) => item.id === current.id);

    if (existingMainObject) {
      if (current.status !== undefined) {
        if (!existingMainObject.statusFlags.includes(current.status)) {
          existingMainObject.statusFlags.push(current.status);
        }
        if (!existingMainObject.roles.includes(current.category)) {
          existingMainObject.roles.push(current.category);
        }
      }
    } else {
      accumulator.push({
        ...current,
        statusFlags: [current.status],
        roles: [current.category],
      });
    }
    return accumulator;
  }, []);

  return groupedResults;
}

export async function GetUsers(): Promise<User[]> {
  const db = await loadDatabase();
  let users = await db.select<DbUser[]>(
    `SELECT users.*, statusFlags.status, userInterestCategories.category FROM users
    LEFT JOIN statusFlags ON users.id = statusFlags.userId
    LEFT JOIN userInterestCategories ON users.id = userInterestCategories.userId
    `,
  );

  return DbUsersToUsers(users);
}

export async function DeleteUser(email: string) {
  const db = await loadDatabase();
  let deleted = await db.execute("DELETE FROM users WHERE email = $1", [email]);
  return deleted;
}

export async function storeUserStatusFlag(email: string, flag: UserStatusFlag) {
  const db = await loadDatabase();
  await db.execute(
    `INSERT into statusFlags (userId, status)
    SELECT users.id, $1
    FROM users
    WHERE email == $2`,
    [flag, email],
  );
}

export async function AddUserCategory(email: string, cat: string) {
  const db = await loadDatabase();
  await db.execute(
    `INSERT into userInterestCategories (userId, category)
    SELECT users.id, $1
    FROM users
    WHERE email == $2`,
    [cat, email],
  );
}

export async function AddUserCategories(email: string, cats: string[]) {
  const db = await loadDatabase();
  for (let cat of cats) {
    await db.execute(
      `INSERT into userInterestCategories (userId, category)
      SELECT users.id, $1
      FROM users
      WHERE email == $2`,
      [cat, email],
    );
  }
}

export async function ClearUserCategories(email: string) {
  const db = await loadDatabase();
  await db.execute(
    `
    DELETE FROM userInterestCategories
    WHERE userId IN (SELECT id FROM users WHERE email = $1)
    `,
    [email],
  );
}
