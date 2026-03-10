/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
use std::path::Path;

use sqlx::sqlite::SqlitePoolOptions;

#[derive(sqlx::FromRow)]
pub struct UserContentState {
    #[sqlx(rename = "contentUri")]
    pub content_uri: String,
    pub data: String,
}

pub async fn get_exportable_states(
    db_path: &Path,
    email: &str,
) -> Result<Vec<UserContentState>, sqlx::Error> {
    let pool = SqlitePoolOptions::new()
        .connect(format!("sqlite:{}", db_path.display()).as_str())
        .await?;

    let state_query = r#"
    SELECT scorm.* FROM scorm
    INNER JOIN users ON users.id = scorm.userId
    WHERE users.email = $1"#;

    let results = sqlx::query_as::<_, UserContentState>(state_query)
        .bind(email)
        .fetch_all(&pool)
        .await?;

    Ok(results)
}
