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
