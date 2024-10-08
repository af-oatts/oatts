mod db;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:test2.db", db::migration::create_migrations())
                .build(),
        )
        .invoke_handler(tauri::generate_handler![utils::exporter::export_data, utils::exporter::export_legalese])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
