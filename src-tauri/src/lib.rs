mod db;
mod utils;
use tauri::http::{Response, StatusCode};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .register_uri_scheme_protocol("oatts", move |ctx, request| {
            let app_handle = ctx.app_handle();
            let path = request.uri().path();
            println!("{}", path);

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

            // 1. Handle redirect logic
            if path == "/oatts/assets/ccc5a2a6-571b-4248-ac8e-3e79bb207ffb.jpg" {
                return Response::builder()
                    .status(StatusCode::FOUND)
                    .header("Location", "/oatts/assets/rick.jpg")
                    .header("Access-Control-Allow-Origin", "*")
                    .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                    .header("Access-Control-Allow-Headers", "*")
                    .body(Vec::new())
                    .unwrap();
            }

            // 3. Hand back to "Default" (Bundled Assets)
            let asset_path = path.strip_prefix('/').unwrap_or(path);
            match app_handle.asset_resolver().get(asset_path.to_string()) {
                Some(asset) => Response::builder()
                    .status(StatusCode::OK)
                    .header("Content-Type", asset.mime_type)
                    .header("Access-Control-Allow-Origin", "*")
                    .header("Cache-Control", "no-cache, no-store, must-revalidate")
                    .header("Pragma", "no-cache")
                    .header("Expires", "0")
                    .body(asset.bytes.to_vec())
                    .unwrap(),
                None => Response::builder()
                    .status(StatusCode::NOT_FOUND)
                    .header("Content-Type", "text/plain")
                    .header("Access-Control-Allow-Origin", "*")
                    .header("Cache-Control", "no-cache")
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
            utils::exporter::export_legalese
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
