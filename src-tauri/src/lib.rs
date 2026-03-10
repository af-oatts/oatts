/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
mod db;
mod utils;
use once_cell::sync::Lazy;
use serde_yaml::Value;
use std::collections::HashMap;
use tauri::http::{Response, StatusCode};
use tauri::Manager;

static REDIRECTS: Lazy<HashMap<String, HashMap<String, u32>>> = Lazy::new(|| {
    let yaml_content = include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/assets/redirects.yml"));
    let root: Value = serde_yaml::from_str(yaml_content).expect("Failed to parse redirects.yml");

    let mut result = HashMap::new();

    if let Some(content) = root.get("content").and_then(|v| v.as_mapping()) {
        for (uuid, files) in content {
            if let (Some(uuid_str), Some(files_map)) = (uuid.as_str(), files.as_mapping()) {
                let mut file_map = HashMap::new();
                flatten_yaml_to_map(files_map, String::new(), &mut file_map);
                result.insert(uuid_str.to_string(), file_map);
            }
        }
    }

    result
});

fn flatten_yaml_to_map(
    mapping: &serde_yaml::Mapping,
    prefix: String,
    result: &mut HashMap<String, u32>,
) {
    for (key, val) in mapping {
        if let Some(key_str) = key.as_str() {
            let new_path = if prefix.is_empty() {
                key_str.to_string()
            } else {
                format!("{}/{}", prefix, key_str)
            };

            if let Some(num) = val.as_u64() {
                result.insert(new_path, num as u32);
            } else if let Some(sub_mapping) = val.as_mapping() {
                flatten_yaml_to_map(sub_mapping, new_path, result);
            }
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .register_uri_scheme_protocol("oatts", move |ctx, request| {
            let app_handle = ctx.app_handle();
            let path = request.uri().path();

            // Handle CORS preflight
            if request.method() == "OPTIONS" {
                return Response::builder()
                    .status(StatusCode::OK)
                    .header("Access-Control-Allow-Origin", "*")
                    .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                    .header("Access-Control-Allow-Headers", "*")
                    .body(Vec::new())
                    .unwrap();
            }

            // Handle mapped assets from YAML
            // Expected format: /oatts/{uuid}/{filepath}
            let mut asset_path = path.strip_prefix('/').unwrap_or(path).to_string();
                        let mut original_extension: Option<String> = None;

            if let Some(stripped) = path.strip_prefix("/oatts/content/") {
                let parts: Vec<&str> = stripped.splitn(2, '/').collect();
                if parts.len() == 2 {
                    let uuid = parts[0];
                    let file_path = parts[1];

                                        // Extract the original file extension
                    if let Some(ext) = std::path::Path::new(file_path)
                        .extension()
                        .and_then(|e| e.to_str())
                    {
                        original_extension = Some(ext.to_string());
                        println!("File: {} Extension: {}", file_path, ext.to_string());
                    }

                    if let Some(uuid_map) = REDIRECTS.get(uuid) {
                        if let Some(&id) = uuid_map.get(file_path) {
                            // Serve the asset directly from /oatts/repo/{id}
                            asset_path = format!("oatts/repo/{}", id);
                            println!("Mapped {} -> {}", path, asset_path);
                        }
                    }
                }
            }

            // Hand back to "Default" (Bundled Assets)
            match app_handle.asset_resolver().get(asset_path) {
                Some(asset) => {
                    let mime_type = if let Some(ext) = original_extension {
                        let from_extension = mime_guess::from_ext(&ext).first_or_octet_stream();
                        if asset.mime_type == "application/octet-stream"
                        || asset.mime_type == "text/plain"
                        {
                            asset.mime_type.to_string()
                        } else {
                            from_extension.to_string()
                        }
                    } else {
                        asset.mime_type.to_string()
                    };
                    return Response::builder()
                        .status(StatusCode::OK)
                        .header("Content-Type", &mime_type)
                        .header("Access-Control-Allow-Origin", "*")
                        .header("Expires", "0")
                        .body(asset.bytes.to_vec()).unwrap();


                },
                None => Response::builder()
                    .status(StatusCode::NOT_FOUND)
                    .header("Content-Type", "text/plain")
                    .header("Access-Control-Allow-Origin", "*")
                    .body("Asset not found".as_bytes().to_vec())
                    .unwrap(),
            }
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:test2.db", db::migration::create_migrations())
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            utils::exporter::export_data,
            utils::exporter::export_legalese,
            utils::github_fetch::get_latest_from_github
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
