use tauri_plugin_shell::ShellExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Launch the bundled Flask backend as a sidecar process.
            let sidecar = app
                .shell()
                .sidecar("api")
                .expect("failed to create sidecar command");
            let (_rx, _child) = sidecar
                .spawn()
                .expect("failed to spawn api sidecar");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}