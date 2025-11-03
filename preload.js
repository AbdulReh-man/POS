const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke("ping"),
  // we can also expose variables, not just functions
  BuiltBy: "AbdulDev",
});

contextBridge.exposeInMainWorld("api", {
  users: {
    getAll: () => ipcRenderer.invoke("users:getAll"),
    getById: (id) => ipcRenderer.invoke("users:getById", id),
    create: (data) => ipcRenderer.invoke("users:create", data),
    delete: (id) => ipcRenderer.invoke("users:delete", id),
  },

  store: {
    saveLogin: (_event, data) =>
      ipcRenderer.invoke("secureStore:saveLogin", data),
    getLogin: () => ipcRenderer.invoke("secureStore:getLogin"),
    clearLogin: () => ipcRenderer.invoke("secureStore:clearLogin"),
    settingsGet: () => ipcRenderer.invoke("settings:get"),
    settingsUpdate: (newSettings) =>
      ipcRenderer.invoke("settings:update", newSettings),
    settingsReset: () => ipcRenderer.invoke("settings:reset"),
  },

  file: {
    selectFile: (options) => ipcRenderer.invoke("select-file", options),
    getFileStats: (filePath) => ipcRenderer.invoke("get-file-stats", filePath),
    saveIcon: (sourcePath, platformName, type) =>
      ipcRenderer.invoke("save-icon", sourcePath, platformName, type),
    deleteIcon: (iconPath) => ipcRenderer.invoke("delete-icon", iconPath),
  },

  storage: {
    // New methods
    getStoragePaths: () => ipcRenderer.invoke("get-storage-paths"),
    openStorageFolder: () => ipcRenderer.invoke("open-storage-folder"),
    getAllIcons: () => ipcRenderer.invoke("get-all-icons"),
    clearAllIcons: () => ipcRenderer.invoke("clear-all-icons"),
  },

  products: {
    create: (data) => ipcRenderer.invoke("products:create", data),
    getAll: () => ipcRenderer.invoke("products:getAll"),
    getById: (id) => ipcRenderer.invoke("products:getById", id),
    update: (id, data) => ipcRenderer.invoke("products:update", id, data),
    delete: (id) => ipcRenderer.invoke("products:delete", id),
    updateStock: (id, stock) =>
      ipcRenderer.invoke("products:updateStock", { id, stock }),
  },

  categories: {
    getAll: () => ipcRenderer.invoke("categories:getAll"),
    create: (data) => ipcRenderer.invoke("categories:create", data),
    delete: (id) => ipcRenderer.invoke("categories:delete", id),
    update: (id, data) => ipcRenderer.invoke("categories:update", id, data),
  },

  suppliers: {
    getAll: () => ipcRenderer.invoke("suppliers:getAll"),
    create: (data) => ipcRenderer.invoke("suppliers:create", data),
  },

  customers: {
    getAll: () => ipcRenderer.invoke("customers:getAll"),
    create: (data) => ipcRenderer.invoke("customers:create", data),
  },

  sales: {
    // Existing methods
    createFull: (data) => ipcRenderer.invoke("sales:createFull", data),
    getById: (id) => ipcRenderer.invoke("sales:getById", id),
    getAll: () => ipcRenderer.invoke("sales:getAll"),
    // New methods for Sales Items
    // addItem: (data) => ipcRenderer.invoke("sales:addItem", data),
    // getItems: (sale_id) => ipcRenderer.invoke("sales:getItems", sale_id),
    // New methods for Printing
    printReceipt: (data) => ipcRenderer.invoke("sales:print", data),
    savePrinter: (data) => ipcRenderer.invoke("sales:save-printer", data),
    getSavedPrinter: () => ipcRenderer.invoke("sales:get-saved-printer"),
  },

  payments: {
    record: (data) => ipcRenderer.invoke("payments:record", data),
    getBySale: (sale_id) => ipcRenderer.invoke("payments:getBySale", sale_id),
  },

  purchases: {
    create: (data) => ipcRenderer.invoke("purchases:create", data),
    addItem: (data) => ipcRenderer.invoke("purchases:addItem", data),
  },

  expenses: {
    getAll: () => ipcRenderer.invoke("expenses:getAll"),
    create: (data) => ipcRenderer.invoke("expenses:create", data),
  },

  stock: {
    getMovements: () => ipcRenderer.invoke("stock:getMovements"),
    addMovement: (data) => ipcRenderer.invoke("stock:addMovement", data),
  },

  dashboard: {
    getDashboardStats: () => ipcRenderer.invoke("dashboard:getDashboardStats"),
    getMonthlySalesTrend: () =>
      ipcRenderer.invoke("dashboard:getMonthlySalesTrend"),
    getSalesByCategory: () =>
      ipcRenderer.invoke("dashboard:getSalesByCategory"),

    getTopSellingProducts: () =>
      ipcRenderer.invoke("dashboard:getTopSellingProducts"),
    getRecentSales: () => ipcRenderer.invoke("dashboard:getRecentSales"),
    getSalesTrends: () => ipcRenderer.invoke("dashboard:getSalesTrends"),
  },
});
