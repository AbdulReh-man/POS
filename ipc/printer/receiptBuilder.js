const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const { nativeImage } = require("electron");
const { generateQRCodeBuffer, generateSocialQRs } = require("./qrHelper");
const Store = require("electron-store").default;
const store = new Store({ name: "settingsStore" });

/**
 * Convert image buffer to ESC/POS raster data
 */
async function imageToRaster(imageBuffer, logoCount = 1, targetWidth) {
  if (!targetWidth) {
    if (logoCount === 1) targetWidth = 180;
    else if (logoCount === 2) targetWidth = 350;
    else if (logoCount >= 3) targetWidth = 500;
  }

  const img = nativeImage.createFromBuffer(imageBuffer);
  const resized = img.resize({ width: targetWidth });
  const pngBuffer = resized.toPNG();
  const png = PNG.sync.read(pngBuffer);

  const width = png.width;
  const height = png.height;
  const bytesPerRow = Math.ceil(width / 8);
  const raster = Buffer.alloc(bytesPerRow * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const grayscale =
        (png.data[idx] + png.data[idx + 1] + png.data[idx + 2]) / 3;
      const pixel = grayscale < 128 ? 1 : 0;
      if (pixel) raster[y * bytesPerRow + (x >> 3)] |= 0x80 >> x % 8;
    }
  }

  const header = Buffer.from([
    0x1d,
    0x76,
    0x30,
    0x00,
    bytesPerRow & 0xff,
    (bytesPerRow >> 8) & 0xff,
    height & 0xff,
    (height >> 8) & 0xff,
  ]);

  return Buffer.concat([header, raster]);
}

async function buildReceiptBuffer(printData = {}, printerWidth = 80) {
  const savedStore =
    store.store ||
    store.getAll?.() ||
    store._store ||
    {};
  console.log("🧾 printData received:", printData, "🧾 savedStore:", savedStore);
  const makeLine = (char = "-") => {
    const width = printerWidth >= 80 ? 48 : 32; // 48 chars for 80mm, 32 for 58mm
    return char.repeat(width) + "\n";
  };

  const ESC = "\x1B";
  const GS = "\x1D";
  let chunks = [];

  // Auto-detect printable pixel width
  const maxWidth = printerWidth >= 80 ? 576 : 384; // 80mm → 576px, 58mm → 384px
  const qrSize = printerWidth >= 80 ? 150 : 130;
  const logoWidth = printerWidth >= 80 ? 130 : 80;

  chunks.push(Buffer.from(`${ESC}@`)); // Initialize printer

  // === LOGO ===
  if (savedStore.logoPath) {
    try {
      let logoBuffer;
      if (savedStore.logoPath.startsWith("http")) {
        const res = await fetch(savedStore.logoPath);
        logoBuffer = Buffer.from(await res.arrayBuffer());
      } else if (fs.existsSync(savedStore.logoPath)) {
        logoBuffer = fs.readFileSync(savedStore.logoPath);
      } else {
        logoBuffer = fs.readFileSync(
          "/home/abdul/Desktop/POS/assets/awami.png"
        );
      }

      if (logoBuffer) {
        const logoRaster = await imageToRaster(logoBuffer, 1, logoWidth);
        chunks.push(Buffer.from(`${ESC}a\x01`)); // center align
        chunks.push(logoRaster);
        chunks.push(Buffer.from("\n"));
      }
    } catch (err) {
      console.error("⚠️ Logo load failed:", err.message);
    }
  }

  // === HEADER ===
  // chunks.push(Buffer.from(`${ESC}a\x01`)); // Center align for store name
  // chunks.push(Buffer.from(`${ESC}!${String.fromCharCode(16)}`)); // Bold large text
  // chunks.push(Buffer.from(`${printData.storeName || "STORE NAME"}\n`));

  // Reset to normal alignment and font
  chunks.push(Buffer.from(`${ESC}!${String.fromCharCode(0)}`)); // Normal text
  chunks.push(Buffer.from(`${ESC}a\x00`)); // Left align

  // Address (left)
  if (savedStore.storeAddress)
    chunks.push(Buffer.from(`${savedStore.storeAddress}\n`));

  // Website (left)
  if (savedStore.website) chunks.push(Buffer.from(`${savedStore.website}\n`));

  // Date (left) + Phone (right)
  if (printData.date || savedStore.phone_number) {
    const left = printData.date ? printData.date : "";
    const right = savedStore.phone_number ? `Ph: ${savedStore.phone_number}` : "";
    const totalLength = left.length + right.length;
    const lineWidth = printerWidth >= 80 ? 48 : 32; // thermal printer char width
    const spaces = Math.max(1, lineWidth - totalLength);
    chunks.push(Buffer.from(`${left}${" ".repeat(spaces)}${right}\n`));
  }

  // Cashier (left) + Order ID (right)
  if (printData.cashier || printData.orderId) {
    const left = printData.cashier ? `Cashier: ${printData.cashier}` : "";
    const right = printData.orderId ? `Order ID: ${printData.orderId}` : "";
    const totalLength = left.length + right.length;
    const lineWidth = printerWidth >= 80 ? 48 : 32;
    const spaces = Math.max(1, lineWidth - totalLength);
    chunks.push(Buffer.from(`${left}${" ".repeat(spaces)}${right}\n`));
  }
  chunks.push(Buffer.from(makeLine()));
  chunks.push(Buffer.from(`${ESC}a\x01`));

  // === ITEMS TABLE ===
  if (Array.isArray(printData.items) && printData.items.length > 0) {
    chunks.push(Buffer.from("Item                 Qty   Price   Total\n"));
    chunks.push(Buffer.from(makeLine()));

    const maxWidthChars = printerWidth >= 80 ? 48 : 32;
    const nameWidth = printerWidth >= 80 ? 20 : 14;
    const qtyWidth = 5;
    const priceWidth = 8;
    const totalWidth = 10;

    for (const item of printData.items) {
      const name = (item.name ?? "Unknown")
        .substring(0, nameWidth)
        .padEnd(nameWidth);
      const qty = String(Number(item.qty ?? 0)).padStart(qtyWidth);
      const price = Number(item.price ?? 0)
        .toFixed(2)
        .padStart(priceWidth);
      const total = (Number(item.qty ?? 0) * Number(item.price ?? 0))
        .toFixed(2)
        .padStart(totalWidth);

      const line = `${name}${qty}${price}${total}\n`;
      chunks.push(Buffer.from(line));
    }

    chunks.push(Buffer.from(makeLine()));
  }

  // === TOTALS ===
  const subtotal = Number(printData.subtotal ?? 0);
  const discount = Number(printData.discount ?? 0);
  const total = Number(printData.total ?? 0);
  const paymentType = printData.paymentType || "Cash";
  const itemCount = printData.items?.length || 0;

  const labelWidth = printerWidth >= 80 ? 30 : 18;
  const valueWidth = printerWidth >= 80 ? 10 : 10;

const formatLine = (label, value, isNegative = false) => {
  const numValue = Number(value);
  const displayValue = isNegative
    ? `-${numValue.toFixed(2)}`
    : numValue.toFixed(2);
  return `${label.padEnd(labelWidth)}${displayValue.padStart(valueWidth)}\n`;
};

// --- Totals ---
const discountAmount = Number(
  printData.discount ?? (subtotal * discount) / 100
);

chunks.push(Buffer.from(formatLine("Subtotal:", subtotal)));
chunks.push(
  Buffer.from(formatLine(`Discount (${discount}%)`, discountAmount, true))
);
chunks.push(Buffer.from(formatLine(`Total: (${savedStore.currency})`, total)));

  chunks.push(Buffer.from(makeLine()));
  chunks.push(
    Buffer.from(
      `Payment: ${paymentType.padEnd(10)} Items: ${String(itemCount).padStart(
        3
      )}\n`
    )
  );
  chunks.push(Buffer.from(makeLine()));

  // === SOCIALS + QR Codes ===
  try {
    if (savedStore.socials && savedStore.socials.length > 0) {
      chunks.push(Buffer.from(`${ESC}a\x01`));
      chunks.push(Buffer.from("Follow & Connect with Us!\n"));
      chunks.push(Buffer.from(makeLine()));

      const mergedQR = await generateSocialQRs(savedStore.socials, 15);
      const qrRaster = await imageToRaster(mergedQR, savedStore.socials.length);
      chunks.push(Buffer.from(`${ESC}a\x01`));
      chunks.push(qrRaster);
      chunks.push(Buffer.from(makeLine()));
    }
  } catch (err) {
    console.warn("⚠️ Social QR generation failed:", err.message);
  }

  chunks.push(Buffer.from(`${ESC}a\x01`)); // Center
  chunks.push(
    Buffer.from(
      `${savedStore.footerNote || "Thank you for shopping!"}\n\n\n\n\n\n\n`
    )
  );
  chunks.push(Buffer.from(`${GS}V\x01`)); // Cut paper

  return Buffer.concat(chunks);
}

module.exports = { buildReceiptBuffer };
