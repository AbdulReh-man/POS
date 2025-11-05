const { createCanvas, loadImage } = require("canvas");

/**
 * Merge QR buffers horizontally
 */
async function mergeQRsHorizontal(qrBuffers, spacing = 10) {
  const images = await Promise.all(qrBuffers.map((buf) => loadImage(buf)));
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

/**
 * Merge QR buffers in a grid
 */
async function mergeQRsGrid(qrBuffers, spacing = 10, maxPerRow = 2) {
  const images = await Promise.all(qrBuffers.map((buf) => loadImage(buf)));
  const qrWidth = images[0].width;
  const qrHeight = images[0].height;
  const rows = Math.ceil(images.length / maxPerRow);

  const totalWidth = qrWidth * maxPerRow + spacing * (maxPerRow - 1);
  const totalHeight = qrHeight * rows + spacing * (rows - 1);

  const canvas = createCanvas(totalWidth, totalHeight);
  const ctx = canvas.getContext("2d");

  for (let i = 0; i < images.length; i++) {
    const row = Math.floor(i / maxPerRow);
    const col = i % maxPerRow;
    const xOffset = col * (qrWidth + spacing);
    const yOffset = row * (qrHeight + spacing);
    ctx.drawImage(images[i], xOffset, yOffset);
  }

  return canvas.toBuffer("image/png");
}

module.exports = { mergeQRsHorizontal, mergeQRsGrid };
