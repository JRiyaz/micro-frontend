use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Emitter};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AppConfig {
    pub frontend_url: Option<String>,
    pub backend_url: String,
}

// Helper to resolve the path to `%APPDATA%/com.tauri.dev/config.json`
pub fn get_config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let config_dir = app.path().app_config_dir()
        .map_err(|e| format!("Failed to get app config dir: {}", e))?;
    
    // Create the directory if it doesn't exist
    if !config_dir.exists() {
        fs::create_dir_all(&config_dir)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }
    
    Ok(config_dir.join("config.json"))
}

// Reads config from disk
pub fn read_config(app: &AppHandle) -> Option<AppConfig> {
    if let Ok(path) = get_config_path(app) {
        if path.exists() {
            if let Ok(contents) = fs::read_to_string(path) {
                if let Ok(config) = serde_json::from_str::<AppConfig>(&contents) {
                    return Some(config);
                }
            }
        }
    }
    None
}

// Writes config to disk
pub fn write_config(app: &AppHandle, config: &AppConfig) -> Result<(), String> {
    let path = get_config_path(app)?;
    let contents = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    
    fs::write(path, contents)
        .map_err(|e| format!("Failed to write config file: {}", e))?;
    
    Ok(())
}

// IPC command returning the active configuration and flavour context
#[tauri::command]
pub fn get_app_config(app: AppHandle) -> serde_json::Value {
    let has_assets = cfg!(feature = "bundled_assets");
    let current_config = read_config(&app);
    
    serde_json::json!({
        "bundled_assets": has_assets,
        "config": current_config
    })
}

// IPC command saving configuration and reloading the app
#[tauri::command]
pub fn save_app_config(app: AppHandle, frontend_url: Option<String>, backend_url: String) -> Result<(), String> {
    let config = AppConfig {
        frontend_url,
        backend_url,
    };
    
    // Save to disk
    write_config(&app, &config)?;
    
    // Fire a custom system event or let lib.rs know to close the setup screen and boot the main window
    app.emit("config-updated", ()).ok();
    
    Ok(())
}
