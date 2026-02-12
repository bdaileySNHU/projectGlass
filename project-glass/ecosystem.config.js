const path = require('path');
const fs = require('fs');

/**
 * Next.js standalone output nests server.js under the full project path.
 * This function locates it by checking the expected standalone directory structure.
 */
const getScriptPath = () => {
  const standaloneDir = path.join(__dirname, '.next', 'standalone');
  
  // Recursive search for server.js in standalone dir
  const findFile = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (file !== 'node_modules') {
          const found = findFile(fullPath);
          if (found) return found;
        }
      } else if (file === 'server.js') {
        return fullPath;
      }
    }
    return null;
  };

  try {
    return findFile(standaloneDir) || '.next/standalone/server.js';
  } catch {
    return '.next/standalone/server.js';
  }
};

module.exports = {
  apps: [{
    name: 'glass',
    script: getScriptPath(),
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      PORT: process.env.PORT || 3000,
      NODE_ENV: 'production',
    },
  }],
};
