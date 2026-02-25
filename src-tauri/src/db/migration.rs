use tauri_plugin_sql::{Migration, MigrationKind};

pub fn create_migrations() -> Vec<Migration> {
    let migrations = vec![
    Migration {
      version: 1,
      description: "Establish the user table",
      sql: "CREATE TABLE users (id INTEGER PRIMARY KEY, firstName TEXT, lastName TEXT, email TEXT UNIQUE, base TEXT, dateAccepted TEXT);",
      kind: MigrationKind::Up,
    },
    Migration {
      version: 2,
      description: "Create the SCORM table",
      sql: "CREATE TABLE scorm (id INTEGER PRIMARY KEY, userId INTEGER NOT NULL, contentUri TEXT NOT NULL, data TEXT NOT NULL, FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE, UNIQUE (userId, contentUri));",
      kind: MigrationKind::Up,
    },
    Migration {
      version: 3,
      description: "Create the user status flag table",
      sql: "CREATE TABLE statusFlags (id INTEGER PRIMARY KEY, userId INTEGER NOT NULL, status TEXT NOT NULL, FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE);",
      kind: MigrationKind::Up
    },
    Migration {
      version: 4,
      description: "Create the table to store user preferred course categories",
      sql: "CREATE TABLE userInterestCategories (id INTEGER PRIMARY KEY, userId INTEGER NOT NULL, category TEXT NOT NULL, FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE);",
      kind: MigrationKind::Up
    },
    Migration {
      version: 5,
      description: "Create the table for the content internal state for a user.",
      sql: "CREATE TABLE userContentState (
        id INTEGER PRIMARY KEY, 
        userId INTEGER NOT NULL, 
        contentUri TEXT NOT NULL, 
        data TEXT NOT NULL,
        numRestarts INTEGER default 0,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE, 
        UNIQUE (userId, contentUri)
      );",
      kind: MigrationKind::Up
    }
  ];

    migrations
}
