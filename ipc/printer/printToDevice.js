const { buildReceiptBuffer } = require("./receiptBuilder");

async function printToDevice(device, printData) {
  device.open();
  const interface0 = device.interface(0);
  if (interface0.isKernelDriverActive()) interface0.detachKernelDriver();
  interface0.claim();

  const endpoint = interface0.endpoints.find((ep) => ep.direction === "out");
  if (!endpoint) throw new Error("No OUT endpoint found");

  const receiptBuffer = await buildReceiptBuffer(printData);

  await new Promise((resolve, reject) => {
    endpoint.transfer(receiptBuffer, (err) => (err ? reject(err) : resolve()));
  });

  interface0.release(true, () => device.close());
  return { success: true, message: "Printed successfully" };
}

module.exports = { printToDevice };
