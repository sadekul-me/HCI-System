import { calculateBounds } from "../../utlis/geometry";

/* =========================
    🔹 INTERNAL CACHE (GC SAFE)
========================= */
const layoutCache = new WeakMap();

/* =========================
    🔹 SEEDED RANDOM (STABLE)
========================= */
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

/* =========================
    🚀 MAIN DRAW FUNCTION
========================= */
export const drawImagesOnCanvas = (
  ctx,
  images,
  options = {},
  forceRedraw
) => {
  if (!ctx || !images?.length) return;

  const {
    maxWidth = 200,
    maxHeight = 200,
    padding = 20,
    rotationRange = 15,
    scaleRange = 0.1,
    randomize = true,
    viewport = null,
  } = options;

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (!img) continue;

    /* =========================
        🔥 SAFE IMAGE LOAD HANDLER
    ========================= */
    if (!img.complete || img.naturalWidth === 0) {
      if (!img.__loadingAttached) {
        img.__loadingAttached = true;

        img.addEventListener("load", () => {
          if (forceRedraw) forceRedraw();
        });
      }
      continue;
    }

    /* =========================
        🧠 SMART CACHE
    ========================= */
    let data = layoutCache.get(img);

    if (!data) {
      const { width, height } = calculateBounds(
        img.naturalWidth,
        img.naturalHeight,
        { maxWidth, maxHeight }
      );

      const seedBase = i * 15485863;

      let x = padding + (i % 8) * 40;
      let y = padding + Math.floor(i / 8) * 40;

      if (randomize) {
        x += (seededRandom(seedBase) - 0.5) * 150;
        y += (seededRandom(seedBase + 1) - 0.5) * 150;
      }

      const rotation = randomize
        ? ((seededRandom(seedBase + 2) - 0.5) * 2 * rotationRange * Math.PI) / 180
        : 0;

      const scale = randomize
        ? 1 + (seededRandom(seedBase + 3) * 2 - 1) * scaleRange
        : 1;

      data = { x, y, width, height, rotation, scale };
      layoutCache.set(img, data);
    }

    const { x, y, width, height, rotation, scale } = data;

    /* =========================
        ⚡ VIEWPORT CULLING
    ========================= */
    if (viewport) {
      const margin = 120;
      if (
        x + width + margin < 0 ||
        y + height + margin < 0 ||
        x - margin > viewport.width ||
        y - margin > viewport.height
      ) {
        continue;
      }
    }

    /* =========================
        🎨 RENDER
    ========================= */
    ctx.save();

    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);

    ctx.drawImage(img, -width / 2, -height / 2, width, height);

    ctx.restore(); // ✅ enough (no extra setTransform)
  }
};