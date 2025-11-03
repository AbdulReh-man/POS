const QRCode = require("qrcode-generator");
const sharp = require("sharp");
const fs = require("fs");

async function generateQRCodeBuffer(data, size = 1024) {
  try {
    const qr = QRCode(0, "H"); // version auto, high error correction
    qr.addData(data);
    qr.make();

    const cellSize = Math.floor(size / qr.getModuleCount());
    const margin = 2;

    // Create sharp image with white background and sharp black pixels
    const width = qr.getModuleCount() * cellSize + margin * 2;
    const height = width;

    const raw = Buffer.alloc(width * height * 4, 255); // RGBA white background

    for (let r = 0; r < qr.getModuleCount(); r++) {
      for (let c = 0; c < qr.getModuleCount(); c++) {
        if (qr.isDark(r, c)) {
          const x = c * cellSize + margin;
          const y = r * cellSize + margin;
          for (let dy = 0; dy < cellSize; dy++) {
            for (let dx = 0; dx < cellSize; dx++) {
              const idx = ((y + dy) * width + (x + dx)) * 4;
              raw[idx] = 0; // R
              raw[idx + 1] = 0; // G
              raw[idx + 2] = 0; // B
              raw[idx + 3] = 255; // A
            }
          }
        }
      }
    }

    return await sharp(raw, {
      raw: { width, height, channels: 4 },
    })
      .resize({ width: size }) // scale smoothly to size
      .png()
      .toBuffer();
  } catch (err) {
    console.error("QR generation failed:", err);
    throw err;
  }
}

async function generateSocialQRs(socials, spacing = 20) {
  const qrSize = 1000;
  const qrBlocks = [];

  for (const s of socials) {
    // Create QR object using qrcode-generator
    const qr = QRCode(0, "H");
    qr.addData(s.link);
    qr.make();

    // Generate base64 PNG manually
    const qrSvg = qr.createSvgTag({ margin: 2, scalable: true});
    const qrBuffer = await sharp(Buffer.from(qrSvg))
      .resize(qrSize)
      .png()
      .toBuffer();

    let iconBuffer = null;
    if (s.iconPath && fs.existsSync(s.iconPath)) {
      iconBuffer = fs.readFileSync(s.iconPath);
    }

    if (iconBuffer) {
      // Resize icon to fit below QR
      const resizedIcon = await sharp(iconBuffer)
        .resize(qrSize * 0.2, qrSize * 0.2, { fit: "contain" })
        .png()
        .toBuffer();

      const qrMeta = await sharp(qrBuffer).metadata();
      const iconMeta = await sharp(resizedIcon).metadata();

      const combinedHeight = qrMeta.height + iconMeta.height + 10;

      const combined = await sharp({
        create: {
          width: qrMeta.width,
          height: combinedHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
      })
        .composite([
          { input: qrBuffer, top: 0, left: 0 },
          {
            input: resizedIcon,
            top: qrMeta.height + 10,
            left: Math.floor((qrMeta.width - iconMeta.width) / 2),
          },
        ])
        .png()
        .toBuffer();

      qrBlocks.push(combined);
    } else {
      qrBlocks.push(qrBuffer);
    }
  }

  // Merge all QRs horizontally
  const metas = await Promise.all(
    qrBlocks.map(async (b) => sharp(b).metadata())
  );
  const totalWidth =
    metas.reduce((sum, m) => sum + m.width, 0) +
    spacing * (qrBlocks.length - 1);
  const maxHeight = Math.max(...metas.map((m) => m.height));

  const composites = [];
  let xOffset = 0;
  for (let i = 0; i < qrBlocks.length; i++) {
    composites.push({ input: qrBlocks[i], left: xOffset, top: 0 });
    xOffset += metas[i].width + spacing;
  }

  return sharp({
    create: {
      width: totalWidth,
      height: maxHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();
}

module.exports = { generateQRCodeBuffer, generateSocialQRs };
