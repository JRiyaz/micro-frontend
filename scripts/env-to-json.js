const fs = require('node:fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Define environment variables with default values
const FILE_PATH = process.env.WORKING_PATH || '../projects/shell/public';
const USER_PORT = process.env.USER_PORT || '4210';
const USER_HOST = process.env.USER_HOST || 'http://localhost';

// Define configurations
const configurations = {
  'env.json': {
    'user-app': `${USER_HOST}:${USER_PORT}/remoteEntry.json`,
  },
  'env.prod.json': {
    'user-app': `${USER_HOST}:${USER_PORT}/user/remoteEntry.json`,
  },
};

// Output directory
const outputDir = path.join(__dirname, FILE_PATH);

// Write configurations to respective JSON files
Object.entries(configurations).forEach(([filename, config]) => {
  const filePath = path.join(outputDir, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
    console.log(`Generated ${filePath}`);
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
  }
});
