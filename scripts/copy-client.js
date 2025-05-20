const fs = require('fs-extra');
const path = require('path');

// Define source and destination directories
const clientSrcDir = path.join(__dirname, '..', 'src', 'client');
const clientDestDir = path.join(__dirname, '..', 'dist', 'client');

// Copy client files to dist folder
async function copyClientFiles() {
  try {
    console.log('Copying client files to dist folder...');
    await fs.copy(clientSrcDir, clientDestDir);
    console.log('Client files copied successfully!');
  } catch (err) {
    console.error('Error copying client files:', err);
    process.exit(1);
  }
}

// Execute copy function
copyClientFiles();