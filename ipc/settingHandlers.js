// main.js
const { app, ipcMain, dialog } = require("electron");
const fs = require("fs").promises;
const path = require("path");

// Getter functions instead of global variables
function getStoragePaths() {
  const userDataPath = app.getPath('userData');
  return {
    userData: userDataPath,
    icons: path.join(userDataPath, 'assets', 'icons'),
    logos: path.join(userDataPath, 'assets', 'logos'),
  };
}


// ============================================
// IPC HANDLERS - ADD THESE
// ============================================

function fileHandlers() {
  // Handler: Select file dialog
  ipcMain.handle('select-file', async (event, options) => {
    try {
      const result = await dialog.showOpenDialog({
        properties: options.properties || ['openFile'],
        filters: options.filters || [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }],
      });
      return result;
    } catch (error) {
      console.error('Error in select-file:', error);
      throw error;
    }
  });


  // Handler: Get file statistics
  ipcMain.handle('get-file-stats', async (event, filePath) => {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        isFile: stats.isFile(),
      };
    } catch (error) {
      console.error('Error in get-file-stats:', error);
      throw error;
    }
  });

  // Handler: Save icon to app directory
  ipcMain.handle('save-icon', async (event, sourcePath, platformName, type = 'icon') => {
    try {
      const { icons: iconsDir, logos: logosDir } = getStoragePaths();
      await fs.mkdir(iconsDir, { recursive: true });
      await fs.mkdir(logosDir, { recursive: true });
    
      // Determine target path
      const ext = path.extname(sourcePath);
      const targetDir = type === 'logo' ? logosDir : iconsDir;
    
      // Create filename
      const fileName = platformName
        ? `${platformName.toLowerCase()}${ext}`
        : `${type}_${Date.now()}${ext}`;
    
      const destPath = path.join(targetDir, fileName);
    
      // Delete old file if exists
      try {
        await fs.access(destPath);
        await fs.unlink(destPath);
        console.log('Deleted old file:', destPath);
      } catch (err) {
        // File doesn't exist, continue
      }
    
      // Copy new file
      await fs.copyFile(sourcePath, destPath);
      console.log('Saved file:', destPath);
    
      return destPath;
    } catch (error) {
      console.error('Error in save-icon:', error);
      throw error;
    }
  });

  // ipcMain.handle(
  //   "save-icon",
  //   async (event, sourcePath, platformName, type = "icon") => {
  //     try {
  //       const { icons, logos } = getStoragePaths();
  //       const targetDir = type === "logo" ? logos : icons;

  //       const ext = path.extname(sourcePath);
  //       const fileName = platformName
  //         ? `${platformName.toLowerCase()}${ext}`
  //         : `${type}_${Date.now()}${ext}`;

  //       const destPath = path.join(targetDir, fileName);

  //       // Delete old file if exists
  //       try {
  //         await fs.unlink(destPath);
  //       } catch (err) {
  //         // File doesn't exist
  //       }

  //       // Copy new file
  //       await fs.copyFile(sourcePath, destPath);
  //       console.log("✅ Saved:", destPath);

  //       return destPath;
  //     } catch (error) {
  //       console.error("❌ Error saving icon:", error);
  //       throw error;
  //     }
  //   }
  // );


  // Handler: Delete icon
  ipcMain.handle('delete-icon', async (event, iconPath) => {
    try {
      await fs.unlink(iconPath);
      console.log('Deleted icon:', iconPath);
      return true;
    } catch (error) {
      console.error('Error in delete-icon:', error);
      return false;
    }
  });
}

function storageHandlers() {// Handler: Get storage paths (useful for debugging)
  ipcMain.handle("get-storage-paths", () => {
    return getStoragePaths();
  });


  // Handler: Open storage folder in file explorer
  ipcMain.handle("open-storage-folder", async () => {
    const { shell } = require("electron");
    await shell.openPath(path.join(userDataPath, "assets"));
  });

  // Handler: Get all icons
  ipcMain.handle("get-all-icons", async () => {
    try {
      const { icons, logos } = getStoragePaths();
      const iconFiles = await fs.readdir(icons);
      const logoFiles = await fs.readdir(logos);

      return {
        icons: iconFiles.map((file) => path.join(icons, file)),
        logos: logoFiles.map((file) => path.join(logos, file)),
      };
    } catch (error) {
      console.error("Error reading icons:", error);
      return { icons: [], logos: [] };
    }
  });

  // Handler: Clear all icons (useful for reset)
  ipcMain.handle("clear-all-icons", async () => {
    try {
      const files = await fs.readdir(iconsDir);
      await Promise.all(
        files.map((file) => fs.unlink(path.join(iconsDir, file)))
      );
      return true;
    } catch (error) {
      console.error("Error clearing icons:", error);
      return false;
    }
  });
}


module.exports = { storageHandlers, fileHandlers, getStoragePaths };