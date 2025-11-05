const QRCode = require("qrcode-generator");
const fs = require("fs");
const { nativeImage } = require("electron");
const { createCanvas, loadImage } = require("canvas");

/**
 * Convert SVG string to PNG buffer with specified size
 */
async function svgToPngBuffer(svg, size) {
  const img = await loadImage(Buffer.from(svg));
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);
  return canvas.toBuffer("image/png");
}

/**
 * Generate single QR code buffer
 */
async function generateQRCodeBuffer(data, size = 1024) {
  const qr = QRCode(0, "H"); // auto version, high error correction
  qr.addData(data);
  qr.make();
  const svg = qr.createSvgTag({ margin: 2, scalable: true });
  return svgToPngBuffer(svg, size);
}

/**
 * Generate multiple social QRs with optional icons
 */
async function generateSocialQRs(socials, spacing = 20) {
  const qrSize = 1000;
  const qrBuffers = [];

  for (const s of socials) {
    const qr = QRCode(0, "H");
    qr.addData(s.link);
    qr.make();
    const qrSvg = qr.createSvgTag({ margin: 2, scalable: true });
    let qrBuffer = await svgToPngBuffer(qrSvg, qrSize);

    if (s.iconPath && fs.existsSync(s.iconPath)) {
      const iconBuffer = fs.readFileSync(s.iconPath);
      const iconImage = await loadImage(iconBuffer);

      const qrImage = await loadImage(qrBuffer);
      const canvas = createCanvas(
        qrImage.width,
        qrImage.height + iconImage.height + 10
      );
      const ctx = canvas.getContext("2d");

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR
      ctx.drawImage(qrImage, 0, 0);

      // Draw icon centered below QR
      ctx.drawImage(
        iconImage,
        (canvas.width - iconImage.width) / 2,
        qrImage.height + 10
      );

      qrBuffer = canvas.toBuffer("image/png");
    }

    qrBuffers.push(qrBuffer);
  }

  // Merge all QRs horizontally
  const images = await Promise.all(qrBuffers.map((b) => loadImage(b)));
  const totalWidth =
    images.reduce((sum, img) => sum + img.width, 0) +
    spacing * (images.length - 1);
  const maxHeight = Math.max(...images.map((img) => img.height));
  const canvas = createCanvas(totalWidth, maxHeight);
  const ctx = canvas.getContext("2d");

  let xOffset = 0;
  for (const img of images) {
    ctx.drawImage(img, xOffset, 0);
    xOffset += img.width + spacing;
  }

  return canvas.toBuffer("image/png");
}

module.exports = { generateQRCodeBuffer, generateSocialQRs };
