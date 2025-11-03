const { ipcMain } = require("electron");
const { saveLogin, getLogin, clearLogin } = require("./settings/secureStore");
const {
  getSettings,
  updateSettings,
  resetSettings,
} = require("./settings/storeSettings");
// const { getUser, setUser, clearUser } = require("../stores/userStore");

function storeIpcHandlers() {
    // 🟩 SECURE STORE (Encrypted login data)
    ipcMain.handle("secureStore:saveLogin", async (_event, data) => {
        saveLogin(data);
        return { success: true };
    });

    ipcMain.handle("secureStore:getLogin", async () => {
        return getLogin();
    });

    ipcMain.handle("secureStore:clearLogin", async () => {
        clearLogin();
        return { success: true };
    });

    // 🟨 SETTINGS STORE (App settings like theme, currency, etc.)
    ipcMain.handle("settings:get", async () => {
        const get = getSettings();
        return get;
    });

    ipcMain.handle("settings:update", async (_event, newSettings) => {
        return updateSettings(newSettings);
    });

    ipcMain.handle("settings:reset", async () => {
        resetSettings();
        return { success: true };
    });

    // 🟦 USER STORE (User info, role, permissions, etc.)
    // ipcMain.handle("user:get", async () => {
    //   return getUser();
    // });

    // ipcMain.handle("user:set", async (_event, userData) => {
    //   return setUser(userData);
    // });

    // ipcMain.handle("user:clear", async () => {
    //   clearUser();
    //   return { success: true };
    // });
}

module.exports = { storeIpcHandlers };