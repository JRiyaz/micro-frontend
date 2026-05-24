mod config;

use tauri::{AppHandle, Listener, Manager, Url, WebviewUrl, WebviewWindowBuilder};
use tauri::menu::{Menu, MenuItem, Submenu};

// Helper to open the setup/configuration window
fn open_setup_window(app: &AppHandle) {
    // If the setup window is already open, focus it
    if let Some(win) = app.get_webview_window("setup") {
        win.set_focus().ok();
        return;
    }

    let _setup_window = WebviewWindowBuilder::new(
        app,
        "setup",
        WebviewUrl::App("setup.html".into())
    )
    .title("Server Setup")
    .inner_size(480.0, 520.0)
    .resizable(false)
    .minimizable(false)
    .build()
    .unwrap();
}

// Helper to open or reload the main application window with active configurations
fn open_main_window(app: &AppHandle) {
    // Close the setup window if it is open
    if let Some(win) = app.get_webview_window("setup") {
        win.close().ok();
    }

    // Read saved configuration
    let config = config::read_config(app).expect("Config should exist here");
    
    // Choose target URL depending on active packaging feature
    let url = if cfg!(feature = "bundled_assets") {
        WebviewUrl::App("index.html".into())
    } else {
        let frontend_url = config.frontend_url.clone().unwrap_or_else(|| "http://localhost:4200".into());
        WebviewUrl::External(Url::parse(&frontend_url).expect("Invalid Frontend URL configured"))
    };

    // Inject Backend API URL globally inside the client context
    let init_script = format!(
        "window.BACKEND_API_URL = '{}'; console.log('Tauri backend injected API:', window.BACKEND_API_URL);",
        config.backend_url
    );

    // If main window already exists, close it to apply the new init_script cleanly
    if let Some(win) = app.get_webview_window("main") {
        win.close().ok();
    }

    let _main_window = WebviewWindowBuilder::new(app, "main", url)
        .title("Inventory Hub")
        .inner_size(1280.0, 800.0)
        .resizable(true)
        .initialization_script(&init_script)
        .build()
        .unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let handle = app.handle().clone();

            // 1. Build the Native Menu
            let reconfigure_item = MenuItem::with_id(
                &handle,
                "reconfigure",
                "Change Server Settings...",
                true,
                None::<&str>,
            )?;
            let settings_menu = Submenu::new(&handle, "Settings", true)?;
            settings_menu.append(&reconfigure_item)?;

            let menu = Menu::new(&handle)?;
            menu.append(&settings_menu)?;
            handle.set_menu(menu)?;

            // 2. Listen for native menu click event
            let handle_menu_click = handle.clone();
            handle.on_menu_event(move |_app, event| {
                if event.id == "reconfigure" {
                    open_setup_window(&handle_menu_click);
                }
            });

            // 3. Listen for configuration save success event (from frontend JS)
            let handle_config_save = handle.clone();
            handle.listen("config-updated", move |_| {
                open_main_window(&handle_config_save);
            });

            // 4. Check if config file exists at startup
            if config::read_config(&handle).is_some() {
                open_main_window(&handle);
            } else {
                open_setup_window(&handle);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            config::get_app_config,
            config::save_app_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
