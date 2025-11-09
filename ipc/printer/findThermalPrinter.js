const usb = require("usb");
const os = require("os");

async function findThermalPrinter() {
  const devices = usb.getDeviceList();
  const knownPrinterVendors = [
    0x0416, // Black Copper / POS printers
    0x04b8, // Epson
    0x154f, // FutureLogic
    0x0525, // Generic POS
    0x28e9, // Xprinter / Zebra
    0x0519, // Citizen
    0x0fe6, // HP / generic
    0x1504, // Custom POS
    0x1fc9, // NXP
    0x0483, // STMicroelectronics
  ];

  for (const device of devices) {
    try {
      const vendorId = device.deviceDescriptor.idVendor;
      const productId = device.deviceDescriptor.idProduct;

      // Try to open safely
      try {
        device.open();
      } catch (err) {
        console.warn(
          `⚠️ Could not open device VID=0x${vendorId.toString(16)}: ${
            err.message
          }`
        );
        continue;
      }

      const iface = device.interface(0);
      const interfaceClass = iface?.descriptor?.bInterfaceClass ?? null;

      // Handle kernel driver only on Linux/macOS
      if (os.platform() !== "win32") {
        try {
          if (iface.isKernelDriverActive()) iface.detachKernelDriver();
        } catch {
          // No problem if not supported
        }
      }

      // Check printer class or known vendor
      if (interfaceClass === 7 || knownPrinterVendors.includes(vendorId)) {
        const result = { vendorId, productId };
        console.log(
          `✅ Found printer: VID=0x${vendorId.toString(
            16
          )} PID=0x${productId.toString(16)}`
        );

        try {
          device.close();
        } catch {}
        return result;
      }

      // Close device safely
      try {
        device.close();
      } catch {}
    } catch (err) {
      console.error(`❌ Error scanning device: ${err.message}`);
    }
  }

  console.warn("⚠️ No thermal printer detected.");
  return null;
}

module.exports = { findThermalPrinter };
