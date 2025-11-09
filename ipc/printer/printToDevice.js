const { buildReceiptBuffer } = require("./receiptBuilder");
const os = require("os");

async function printToDevice(device, printData) {
  device.open();

  const interface0 = device.interface(0);

  // ✅ Only check/detach kernel driver on Linux (Windows does not support this)
  if (os.platform() !== "win32") {
    if (interface0.isKernelDriverActive()) {
      interface0.detachKernelDriver();
    }
  }

  interface0.claim();

  const endpoint = interface0.endpoints.find((ep) => ep.direction === "out");
  if (!endpoint) throw new Error("No OUT endpoint found");

  const receiptBuffer = await buildReceiptBuffer(printData);

  await new Promise((resolve, reject) => {
    endpoint.transfer(receiptBuffer, (err) => (err ? reject(err) : resolve()));
  });

  // ✅ Use a safe close pattern
  await new Promise((resolve) => {
    interface0.release(true, () => {
      device.close();
      resolve();
    });
  });

  return { success: true, message: "Printed successfully" };
}

module.exports = { printToDevice };
