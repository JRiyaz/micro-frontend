const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, 'dist', 'desktop-bundle');

function main() {
  console.log("Preparing microscopic Non-assets Desktop Bundle...");

  // 1. Clean and create target folder
  if (fs.existsSync(TARGET_DIR)) {
    fs.rmSync(TARGET_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  // 2. Copy setup.html to target directory as both setup.html and index.html
  const setupSrc = path.join(__dirname, 'src-tauri', 'setup.html');
  const setupDest = path.join(TARGET_DIR, 'setup.html');
  const indexDest = path.join(TARGET_DIR, 'index.html');

  console.log(`Copying setup UI: ${setupSrc} -> ${setupDest}`);
  fs.copyFileSync(setupSrc, setupDest);
  fs.copyFileSync(setupSrc, indexDest); // As index.html to satisfy compiler check

  console.log("\n========================================");
  console.log("Compiling Web-hosted Desktop Application Installer...");
  console.log("========================================");

  // 3. Trigger Tauri build
  execSync('pnpm tauri build', { stdio: 'inherit' });

  console.log("\nWeb-hosted Desktop Application built successfully!");
}

main();
