mod config;

use tauri::{AppHandle, Listener, Manager, Url, WebviewUrl, WebviewWindowBuilder};
use tauri::menu::{Menu, MenuItem, Submenu, PredefinedMenuItem};

// Helper to open the setup/configuration window
fn open_setup_window(app: &AppHandle) {
    // If the setup window is already open, focus it
    if let Some(win) = app.get_webview_window("setup") {
        win.set_focus().ok();
        return;
    }

    // Close main window if it is open so only the setup screen is active
    if let Some(win) = app.get_webview_window("main") {
        win.close().ok();
    }

    let _setup_window = WebviewWindowBuilder::new(
        app,
        "setup",
        WebviewUrl::App("setup.html".into())
    )
    .title("Server Setup")
    .inner_size(480.0, 520.0)
    .resizable(true)
    .minimizable(true)
    .initialization_script("document.addEventListener('contextmenu', e => e.preventDefault());")
    .build(); // Removed .unwrap() to prevent crash panics
}

// Helper to open the main window completely fresh on the main thread
fn open_main_window_fresh(app: &AppHandle) {
    // Read saved configuration
    let config = config::read_config(app).expect("Config should exist here");
    
    // Choose target URL depending on active packaging feature
    let url = if cfg!(feature = "bundled_assets") {
        Url::parse("tauri://localhost/index.html").unwrap()
    } else {
        let frontend_url = config.frontend_url.clone().unwrap_or_else(|| "http://localhost:4200".into());
        Url::parse(&frontend_url).expect("Invalid Frontend URL configured")
    };

    // Inject Backend API URL globally and disable the default browser right-click context menu
    let init_script = format!(
        "window.BACKEND_API_URL = '{}'; \
         document.addEventListener('contextmenu', e => e.preventDefault()); \
         console.log('Tauri backend injected API:', window.BACKEND_API_URL);",
        config.backend_url
    );

    let webview_url = WebviewUrl::External(url);
    
    // Run on the main thread to prevent cross-thread window creation crashes
    let app_clone = app.clone();
    app.run_on_main_thread(move || {
        let _main_window = WebviewWindowBuilder::new(&app_clone, "main", webview_url)
            .title("Inventory Hub")
            .inner_size(1280.0, 800.0)
            .resizable(true)
            .initialization_script(&init_script)
            .build();
    }).ok();
}

// Helper to open or reload the main application window with active configurations
fn open_main_window(app: &AppHandle) {
    // Close the setup window if it is open
    if let Some(win) = app.get_webview_window("setup") {
        win.close().ok();
    }

    if let Some(win) = app.get_webview_window("main") {
        // If main window already exists, close it
        win.close().ok();
        
        // Spawn a thread to wait for the window to finish closing, then create it fresh
        let handle = app.clone();
        std::thread::spawn(move || {
            std::thread::sleep(std::time::Duration::from_millis(200));
            open_main_window_fresh(&handle);
        });
    } else {
        open_main_window_fresh(app);
    }
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

            // Standard File Menu containing native Exit
            let file_menu = Submenu::new(&handle, "File", true)?;
            let quit_item = PredefinedMenuItem::quit(&handle, Some("Exit"))?;
            file_menu.append(&quit_item)?;

            // Dedicated Top-level Settings Menu
            let settings_menu = Submenu::new(&handle, "Settings", true)?;
            settings_menu.append(&reconfigure_item)?;

            // Native Window Menu containing Minimize/Close
            let window_menu = Submenu::new(&handle, "Window", true)?;
            let minimize_item = PredefinedMenuItem::minimize(&handle, Some("Minimize"))?;
            let close_item = PredefinedMenuItem::close_window(&handle, Some("Close"))?;
            window_menu.append(&minimize_item)?;
            window_menu.append(&close_item)?;

            let menu = Menu::new(&handle)?;
            menu.append(&file_menu)?;
            menu.append(&settings_menu)?;
            menu.append(&window_menu)?;
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
