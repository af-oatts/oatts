use serde::{Deserialize, Serialize};

/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
#[derive(Deserialize)]
struct GithubRelease {
    tag_name: String,
    name: Option<String>,
    published_at: String,
    body: Option<String>,
    html_url: String,
}

#[derive(Serialize)]
pub struct ReleaseLite {
    pub tag: String,
    pub name: String,
    pub published_at: String,
    pub notes: String,
    pub html_url: String,
    pub prerelease: bool,
}

#[tauri::command]
pub async fn get_latest_from_github(owner: &str, repo: &str) -> Result<ReleaseLite, String> {
    let client = reqwest::Client::new();
    let url = format!("https://api.github.com/repos/{owner}/{repo}/releases/latest");

    let data: GithubRelease = client
        .get(&url)
        .header("Accept", "application/vnd.github+json")
        .send()
        .await
        .map_err(|e| e.to_string())?
        .error_for_status()
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;

    Ok(ReleaseLite {
        tag: data.tag_name.clone(),
        name: data.name.unwrap_or(data.tag_name),
        published_at: data.published_at,
        notes: data.body.unwrap_or_default(),
        html_url: data.html_url,
        prerelease: false,
    })
}