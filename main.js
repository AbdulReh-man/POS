const db = require("./db"); // 👈 our initialized DB will run table creation
const { app, BrowserWindow, Menu } = require("electron");
const path = require("node:path");
const isDev = !app.isPackaged; // true if running `npm run dev`
const { registerIpcHandlers } = require("./ipc/ipcHandlers");
const { storeIpcHandlers } = require("./ipc/storeHandlers");
const {print} = require("./ipc/printer/index")
const { storageHandlers, fileHandlers , getStoragePaths} = require("./ipc/settingHandlers");
const fs = require("fs").promises;
// const menu = Menu.buildFromTemplate([
//   {
//     label: "File",
//     submenu: [
//       {
//         role: "quit",
//       },
//     ],
//   },
//   {
//     label: "Edit",
//     submenu: [
//       { role: "undo" },
//       { role: "redo" },
//       { type: "separator" },
//       { role: "cut" },
//       { role: "copy" },
//       { role: "paste" },
//     ],
//   },
// ]);
Menu.setApplicationMenu(null);

// ============================================
// STORAGE PATHS - DEFINE AT TOP LEVEL
// ============================================

async function initializeStorage() {
  try {
    const { icons, logos } = getStoragePaths();
    await fs.mkdir(icons, { recursive: true });
    await fs.mkdir(logos, { recursive: true });
    console.log('✅ Storage initialized');
  } catch (error) {
    console.error('❌ Storage initialization failed:', error);
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });
  if (isDev) {
    const viteURL = "http://localhost:5173";

    // retry until vite dev server is ready
    const loadVite = () => {
      mainWindow.loadURL(viteURL).catch(() => {
        setTimeout(loadVite, 500);
      });
    };

    loadVite();
    mainWindow.webContents.openDevTools(); // optional
  } else {
    mainWindow.loadFile(path.join(__dirname, "frontend/dist/index.html"));
  }
}

app.disableHardwareAcceleration();

app.whenReady().then(async() => {
  await initializeStorage();
  fileHandlers();
  storageHandlers();
  storeIpcHandlers();
  registerIpcHandlers();
  print();
  createWindow();
  console.log("App is ready");
  
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
