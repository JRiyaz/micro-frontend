const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECTS = [
  { name: 'ui-shared', type: 'library', command: 'ng build --project ui-shared' },
  { name: 'shell', type: 'application', distName: 'shell' },
  { name: 'user-service', type: 'application', distName: 'user-service' },
  { name: 'store-service', type: 'application', distName: 'store-service' },
  { name: 'inventory-hub', type: 'application', distName: 'inventory-hub' }
];

const TARGET_DIR = path.join(__dirname, 'dist', 'desktop-bundle');

function runCommand(command) {
  console.log(`\n========================================`);
  console.log(`[Executing]: ${command}`);
  console.log(`========================================`);
  execSync(command, { stdio: 'inherit' });
}

function cleanAndCreateDir(dir) {
  if (fs.existsSync(dir)) {
    console.log(`Cleaning target directory: ${dir}`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

function getBrowserDistPath(projectName) {
  const rootDist = path.join(__dirname, 'dist', projectName);
  const browserSubDir = path.join(rootDist, 'browser');
  
  if (fs.existsSync(browserSubDir)) {
    return browserSubDir;
  }
  return rootDist;
}

function copyFolderRecursive(src, dest) {
  console.log(`Copying: ${src} -> ${dest}`);
  fs.cpSync(src, dest, { recursive: true, force: true });
}

function main() {
  const start = Date.now();
  console.log("Starting unified Desktop Bundle compilation...");

  // 1. Clean or create the output bundling directory
  cleanAndCreateDir(TARGET_DIR);

  // 2. Build the ui-shared library first
  runCommand('ng build --project ui-shared');

  // 3. Build each application project in production configuration
  for (const proj of PROJECTS) {
    if (proj.type === 'application') {
      runCommand(`ng build ${proj.name} --configuration production`);
    }
  }

  // 4. Merge all built assets
  console.log("\n========================================");
  console.log("Merging project dist assets...");
  console.log("========================================");

  // Copy shell to root of bundle
  const shellSrc = getBrowserDistPath('shell');
  if (fs.existsSync(shellSrc)) {
    copyFolderRecursive(shellSrc, TARGET_DIR);
  } else {
    throw new Error(`Shell build not found at: ${shellSrc}`);
  }

  // Copy remotes to sub-directories
  const remotes = ['user-service', 'store-service', 'inventory-hub'];
  for (const remote of remotes) {
    const remoteSrc = getBrowserDistPath(remote);
    const remoteDest = path.join(TARGET_DIR, remote);
    
    if (fs.existsSync(remoteSrc)) {
      fs.mkdirSync(remoteDest, { recursive: true });
      copyFolderRecursive(remoteSrc, remoteDest);
    } else {
      console.warn(`[Warning]: Build for remote '${remote}' not found at: ${remoteSrc}`);
    }
  }

  // 5. Copy setup.html to target bundle directory
  const setupSrc = path.join(__dirname, 'src-tauri', 'setup.html');
  const setupDest = path.join(TARGET_DIR, 'setup.html');
  console.log(`Copying setup UI: ${setupSrc} -> ${setupDest}`);
  fs.copyFileSync(setupSrc, setupDest);

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\n========================================`);
  console.log(`Desktop Bundle created successfully under: ${TARGET_DIR}`);
  console.log(`Completed in ${duration}s!`);
  console.log(`========================================\n`);
}

main();
