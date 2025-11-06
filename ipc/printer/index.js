const { ipcMain } = require("electron");
const Store = require("electron-store").default;
const usb = require("usb");
const { findThermalPrinter } = require("./findThermalPrinter");
const { printToDevice } = require("./printToDevice");

// ✅ Use one consistent key across the app
const store = new Store({ name: "printer-config" });
const PRINTER_KEY = "printer";

function print() {
  // 🖨 Save printer configuration
  ipcMain.handle("sales:save-printer", async (e, printerConfig) => {
    store.set(PRINTER_KEY, printerConfig);
    return { success: true };
  });

  // 📦 Get saved printer configuration
  ipcMain.handle("sales:get-saved-printer", async () => {
    const printer = store.get(PRINTER_KEY, null);
    return printer;
  });

  // 🧾 Print Handler
  ipcMain.handle("sales:print", async (e, printData = {}) => {
    try {
      let printerInfo = store.get(PRINTER_KEY);

      // Auto-detect printer if not found
      if (!printerInfo) {
        printerInfo = await findThermalPrinter();
        if (!printerInfo) throw new Error("No thermal printer found");
        store.set(PRINTER_KEY, printerInfo);
      }

      // Find connected printer by IDs
      let device = usb.findByIds(printerInfo.vendorId, printerInfo.productId);

      // If not found, try re-detecting
      if (!device) {
        printerInfo = await findThermalPrinter();
        if (!printerInfo) throw new Error("Printer disconnected");
        store.set(PRINTER_KEY, printerInfo);
        device = usb.findByIds(printerInfo.vendorId, printerInfo.productId);
      }
      
      // ✅ Only print if not testMode
      if (printData.testMode) {
        return await { success: true, message: "Printer Detected Successfully" };
      }

      // ✅ Send to print
      return await printToDevice(device, printData);
    } catch (err) {
      console.error("❌ Print error:", err);
      return { success: false, error: err.message };
    }
  });
}

module.exports = { print };
