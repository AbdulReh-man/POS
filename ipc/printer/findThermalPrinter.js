const usb = require("usb");

async function findThermalPrinter() {
  const devices = usb.getDeviceList();
  const knownPrinterVendors = [
    0x0416, 0x04b8, 0x154f, 0x0525, 0x28e9, 0x0519, 0x0fe6, 0x1504, 0x1fc9,
    0x0483,
  ];

  for (const device of devices) {
    try {
      const vendorId = device.deviceDescriptor.idVendor;
      const productId = device.deviceDescriptor.idProduct;

      device.open();
      const interface0 = device.interface(0);
      const interfaceClass = interface0.descriptor.bInterfaceClass;
      device.close();

      if (interfaceClass === 7 || knownPrinterVendors.includes(vendorId)) {
        console.log(
          `✅ Found printer: VID=0x${vendorId.toString(
            16
          )} PID=0x${productId.toString(16)}`
        );
        return { vendorId, productId };
      }
    } catch {
      continue;
    }
  }

  return null;
}

module.exports = { findThermalPrinter };
