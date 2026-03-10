
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import Database from "@tauri-apps/plugin-sql";
import { Status } from "../model/Status";
import User from "../model/UserModel";
type DbStatus = {
    userId: string;
    contentUri: string;
    data: string;
};

export async function GetStatusesFromDB(db: Database, user: User): Promise<Map<string, Status>> {

    let rows = await db.select<DbStatus[]>(
        `
        SELECT userContentState.* FROM userContentState
        INNER JOIN users ON users.id = userContentState.userId
        WHERE users.email = $1
        `,
        [user.email],
    );
    

    const statuses = rows.reduce<Map<string, Status>>((acc: Map<string, Status>, row) => {
        try {
            const status: Status = JSON.parse(row.data);
            return acc.set(row.contentUri, status);
        } catch (_) {
            console.error(`Malformed status found in database for user ${row.contentUri} content ${row.contentUri}. Skipping.`);
            return acc;
        }
    }, new Map());

    return statuses;
}


export async function WriteStatusToDB(db: Database, user: User, id: string, status: Status) {

    await db.execute(
        `
        INSERT OR REPLACE INTO userContentState (userId, contentUri, data)
        SELECT users.id, $1, $2
        FROM users
        WHERE users.email = $3
      `,
        [id, JSON.stringify(status), user.email],
    );
}