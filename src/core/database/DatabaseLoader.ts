
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import Database from "@tauri-apps/plugin-sql";

let db: Database | undefined = undefined;

export default async function loadDatabase(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:test2.db");
    await db.execute("PRAGMA foreign_keys = ON");
    return db;
  }
  return db;
}
