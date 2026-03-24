/**
 * ⚡️ ULTRA-LIGHT GEOMETRY FOR IMAGES
 * Location: src/utils/imageUtils.js
 */
export const getProImageBounds = (img, canvas) => {
  if (!img || !canvas) return null;

  const canvasW = canvas.width;
  const canvasH = canvas.height;
  const padding = 120; // ক্লিন লুকের জন্য মার্জিন

  const scale = Math.min(
    (canvasW - padding) / img.width,
    (canvasH - padding) / img.height
  );

  return {
    width: img.width * scale,
    height: img.height * scale,
    x: (canvasW - img.width * scale) / 2, // সেন্টারিং
    y: (canvasH - img.height * scale) / 2
  };
};