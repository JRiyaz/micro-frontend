const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

const shellIp = process.env.SHELL_IP || 'localhost';
const shellPort = process.env.SHELL_PORT || '4200';
const userIp = process.env.USER_IP || 'localhost';
const userPort = process.env.USER_PORT || '4210';
const apiIp = process.env.API_IP || 'localhost';
const apiPort = process.env.API_PORT || '3000';

const isProd = process.env.NODE_ENV === 'production';
const userAppUrl = `http://${userIp}:${userPort}/remoteEntry.json`;
const apiUrl = `http://${apiIp}:${apiPort}`;

// 1. Generate federation.manifest.json for Shell
const manifestPath = path.join(
  __dirname,
  'projects/shell/public/federation.manifest.json',
);
const manifestData = {
  'user-app': userAppUrl,
};

// Ensure the directory exists
const manifestDir = path.dirname(manifestPath);
if (!fs.existsSync(manifestDir)) {
  fs.mkdirSync(manifestDir, { recursive: true });
}

fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2), 'utf8');
console.log('✅ Generated federation.manifest.json');

// 2. Generate environments for Shell and User
const envContent = `export const environment = {
  production: ${isProd},
  apiUrl: '${apiUrl}'
};
`;

const apps = [
  { name: 'shell', path: 'projects/shell/src/environments' },
  { name: 'user', path: 'projects/user/frontend/src/environments' },
];

for (const app of apps) {
  const envDir = path.join(__dirname, app.path);
  if (!fs.existsSync(envDir)) {
    fs.mkdirSync(envDir, { recursive: true });
  }

  fs.writeFileSync(path.join(envDir, 'environment.ts'), envContent, 'utf8');
  fs.writeFileSync(
    path.join(envDir, 'environment.development.ts'),
    envContent,
    'utf8',
  );
  console.log(`✅ Generated environment.ts for ${app.name}`);
}
