const sharp = require("sharp");

async function mergeQRsHorizontal(qrBuffers, spacing = 10) {
  const images = await Promise.all(
    qrBuffers.map(async (buf) => {
      const img = sharp(buf);
      const meta = await img.metadata();
      return { img, meta };
    })
  );

  const totalWidth =
    images.reduce((sum, { meta }) => sum + meta.width, 0) +
    spacing * (images.length - 1);
  const maxHeight = Math.max(...images.map(({ meta }) => meta.height));

  // Combine horizontally
  const compositeImages = [];
  let xOffset = 0;
  for (const { img, meta } of images) {
    compositeImages.push({
      input: await img.toBuffer(),
      left: xOffset,
      top: 0,
    });
    xOffset += meta.width + spacing;
  }

  return sharp({
    create: {
      width: totalWidth,
      height: maxHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite(compositeImages)
    .png()
    .toBuffer();
}

async function mergeQRsGrid(qrBuffers, spacing = 10, maxPerRow = 2) {
  const images = await Promise.all(
    qrBuffers.map(async (buf) => {
      const img = sharp(buf);
      const meta = await img.metadata();
      return { img, meta };
    })
  );

  const qrWidth = images[0].meta.width;
  const qrHeight = images[0].meta.height;
  const rows = Math.ceil(images.length / maxPerRow);
  const totalWidth = qrWidth * maxPerRow + spacing * (maxPerRow - 1);
  const totalHeight = qrHeight * rows + spacing * (rows - 1);

  const compositeImages = [];
  for (let i = 0; i < images.length; i++) {
    const row = Math.floor(i / maxPerRow);
    const col = i % maxPerRow;
    const xOffset = col * (qrWidth + spacing);
    const yOffset = row * (qrHeight + spacing);
    compositeImages.push({
      input: await images[i].img.toBuffer(),
      left: xOffset,
      top: yOffset,
    });
  }

  return sharp({
    create: {
      width: totalWidth,
      height: totalHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite(compositeImages)
    .png()
    .toBuffer();
}

module.exports = { mergeQRsGrid , mergeQRsHorizontal};
