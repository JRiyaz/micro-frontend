# Tauri Desktop Application Integration Manual

This manual provides a comprehensive, step-by-step developer guide for setting up, configuring, running, and packaging your Angular Native Federation micro-frontend application as a native Windows desktop application using **Tauri v2**.

---

## 1. Prerequisites & Toolchain Setup

Because Tauri compiles a high-performance native binary in Rust, you must have the required compiler toolchains installed on your Windows development machine.

### Step 1.1: Install Node.js & PNPM
Ensure you have Node.js and `pnpm` installed:
* **Node.js:** v18 or later.
* **PNPM:** v8 or later (this project uses `pnpm`).

### Step 1.2: Install the Rust Compiler Toolchain
1. Download `rustup-init.exe` from the official Rust website: [rustup.rs](https://rustup.rs/).
2. Run the installer and choose the **default option (1)**.
3. If the installer prompts you that **Microsoft C++ Build Tools** are missing, follow the link to download the Visual Studio Build Tools, select the **Desktop development with C++** workload during VS installation, and complete the setup.
4. **Restart your terminal** or command prompt after the installation completes so Windows loads the new environment variables (`cargo`, `rustc`).

---

## 2. Integrated Code Architecture

The Tauri integration introduces several files that coordinate configurations and build pipelines:

### Desktop Code (`src-tauri/`)
* **`src-tauri/tauri.conf.json`**: The central configuration for Tauri. Maps the window size (`1280x800`), sets the unique identifier (`com.inventory.desktop`), and sets the target directory (`dist/desktop-bundle`).
* **`src-tauri/src/config.rs`**: A Rust module that manages local disk read/write configuration (`config.json` inside `%APPDATA%/com.inventory.desktop/`) and exposes Tauri IPC commands (`get_app_config` and `save_app_config`).
* **`src-tauri/src/lib.rs`**: Core lifecycle runner. Defines the native window menu, listens for reconfiguration clicks, and handles dynamic startup window creation (Setup window vs Main window).
* **`src-tauri/setup.html`**: A lightweight, glassmorphic dark-mode setup screen packaged directly in the binary to prompt users for their addresses on startup.

### Automated Build Compilers
* **`bundle-desktop.js`**: Runs production builds for *all four* micro-frontends (`shell`, `user-service`, `store-service`, `inventory-hub`) and merges their outputs recursively into `/dist/desktop-bundle`.
* **`build-nonassets.js`**: Prepares a microscopic setup-only bundle (`setup.html`) and triggers the installer compiler.

---

## 3. Development Workflow (Local Testing)

During development, the desktop application runs as a secure browser shell loading your active local development servers.

### Step 3.1: Start the Web Development Servers
In your first terminal, boot up the entire micro-frontend stack:
```sh
pnpm start
```
*(Wait until the output shows that the library is built and the server is active on `http://localhost:4200`)*

### Step 3.2: Launch the Desktop App
Open a **second, separate terminal** and run:
```sh
pnpm desktop:tauri
```
* **Command Action:** Triggers `tauri dev`. It compiles the debug binary, launches a native window, loads `http://localhost:4200`, and opens the active Webview Developer Tools (accessible via right-click -> Inspect).

---

## 4. Production Build & Installer Generation

To package the application into a standalone setup wizard (`.exe` or `.msi`) for distribution to end-users, choose one of the two packaging flavours:

### Flavour A: Web-Hosted (Hybrid)
* **Description:** Bundles *only* the local setup window. At startup, the user configures their Web URL (where you host the compiled Angular site) and their API URL. The app loads your live website dynamically.
* **Command to Run:**
  ```sh
  pnpm desktop:tauri:build-nonassets
  ```
* **Behind the Scenes:**
  1. Runs `node build-nonassets.js`.
  2. Cleans `/dist/desktop-bundle` and copies *only* the setup page (`setup.html`) into it.
  3. Triggers `tauri build` to package a microscopic installer (~11MB).

### Flavour B: Assets-bundled (Standalone)
* **Description:** Compiles and packs all four Angular micro-frontends completely offline inside the installer executable. At startup, the user is prompted *only* for the Backend API Address.
* **Command to Run:**
  ```sh
  pnpm desktop:tauri:build-bundled
  ```
* **Behind the Scenes:**
  1. Executes `node bundle-desktop.js`.
  2. Compiles `ui-shared`, then compiles `shell`, `user-service`, `store-service`, and `inventory-hub`.
  3. Merges all build files recursively into `/dist/desktop-bundle` and copies `setup.html` into it.
  4. Runs `tauri build --features bundled_assets` to bundle all assets (~25MB installer).

---

## 5. Locating and Installing Output Packages

Once the build command completes, your installers are generated under:

* **NSIS Setup Installer (`.exe`):**
  `src-tauri/target/release/bundle/nsis/inventory-desktop_0.1.0_x64-setup.exe`
* **Enterprise MSI (`.msi`):**
  `src-tauri/target/release/bundle/msi/inventory-desktop_0.1.0_x64_en-US.msi`

**To Install:**
1. Navigate to the `.exe` folder.
2. Double-click `inventory-desktop_0.1.0_x64-setup.exe` to run the Windows Setup Wizard.
3. Install the application. A shortcut named **inventory-desktop** will be created on your Desktop and in the Start Menu.

---

## 6. How to Reconfigure Your Application URLs

### Method A: Through the Application Menu (User Friendly)
1. Launch your installed **Inventory Hub** application.
2. In the top window menu bar, click **`Settings` -> `Change Server Settings...`**.
3. The setup form will launch automatically, **pre-filling your existing URLs**.
4. Update the addresses and click **Save Configurations**. The app immediately reloads with the new settings!

### Method B: Manual File Edit (Developer Troubleshooting)
If you need to view or edit the configurations manually on disk:
1. Press `Win + R`, type `%APPDATA%`, and press Enter.
2. Open the `com.inventory.desktop` directory.
3. Open `config.json` with a text editor.
4. Modify the values directly and save:
   ```json
    {
      "frontend_url": "https://app.inventory.com",
      "backend_url": "https://api.inventory.com"
    }
    ```

---

## 7. Cross-Platform Builds & macOS (DMG)

Because packaging a macOS application bundle (`.app`) and disk image (`.dmg`) requires native Apple developer tools and filesystem utilities, **you must compile macOS applications on a macOS operating system**. 

To make this seamless, we support two methods for generating macOS installers:

### Method A: Local Compilation (On a Mac)
If you or a colleague have a Mac computer, you can compile the `.dmg` installer locally:
1. Clone the repository and checkout the `desktop-tauri` branch.
2. Install the Rust compiler on the Mac:
   ```sh
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
3. Run the standalone production build script:
   ```sh
   pnpm install
   pnpm desktop:tauri:build-bundled
   ```
4. **Where to find the DMG installer:**
   Tauri will automatically generate the Disk Image inside:
   `src-tauri/target/release/bundle/dmg/inventory-desktop_0.1.0_x64.dmg` *(or `_aarch64.dmg` on Apple Silicon M1/M2/M3 Macs).*

### Method B: Cloud Compilation (Automated CI/CD via GitHub)
We have configured a professional **GitHub Actions workflow** under [`.github/workflows/release.yml`](file:///c:/Users/Riyaz%20J/work/micro-frontend/.github/workflows/release.yml) to compile installers in the cloud.

To trigger the automated cloud build:
1. Commit and push all your desktop changes to your GitHub repository.
2. Tag a release version using Git (e.g. `v0.1.0`):
   ```sh
   git tag v0.1.0
   git push origin v0.1.0
   ```
3. **What happens behind the scenes:**
   * GitHub will spin up a **Windows runner** to build your `.exe`/`.msi` installers.
   * GitHub will spin up a **macOS runner** to compile your native **`.dmg`** installer.
   * Once finished, a **Release Draft** is automatically created on your GitHub repository page containing all installers, ready to publish to your users!
