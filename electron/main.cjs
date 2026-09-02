const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow = null;
let backendProcess = null;

const isDev = process.env.NODE_ENV === 'development';

/**
 * Start the local Python backend process if packaged
 */
function startBackend() {
  if (isDev) {
    console.log('[CleanMark Desktop] Development mode: Connecting to local backend on port 8000');
    return;
  }

  // Look for backend executable in resources or local folder
  const possiblePaths = [
    path.join(process.resourcesPath, 'backend', 'cleanmark-backend.exe'),
    path.join(__dirname, '../../backend/dist/cleanmark-backend/cleanmark-backend.exe'),
    path.join(process.cwd(), 'resources/backend/cleanmark-backend.exe'),
  ];

  for (const backendPath of possiblePaths) {
    try {
      const fs = require('fs');
      if (fs.existsSync(backendPath)) {
        console.log(`[CleanMark Desktop] Launching backend from: ${backendPath}`);
        backendProcess = spawn(backendPath, [], {
          detached: false,
          stdio: 'ignore',
          windowsHide: true,
        });
        break;
      }
    } catch (e) {
      // continue searching
    }
  }
}

/**
 * Create the Native Desktop Window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    title: 'CleanMark AI',
    icon: path.join(__dirname, '../public/icon.ico'),
    backgroundColor: '#07050f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
    autoHideMenuBar: true,
    show: false,
  });

  const indexPath = path.join(__dirname, '../dist/index.html');
  console.log('[CleanMark Desktop] Loading UI from:', indexPath);

  mainWindow.loadFile(indexPath);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Clean shutdown: Kill backend child process on exit
app.on('before-quit', () => {
  if (backendProcess) {
    console.log('[CleanMark Desktop] Shutting down backend process...');
    try {
      backendProcess.kill();
    } catch (e) {
      console.warn('[CleanMark Desktop] Error killing backend:', e);
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
