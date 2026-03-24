/**
 * 📐 OMNI-PRECISE V5.2 — PRODUCTION ENGINE
 * ✔ Stable smoothing (no jitter)
 * ✔ Safe prediction (optional)
 * ✔ Consistent API
 * ✔ GC optimized (optional reuse)
 * ✔ Clean + maintainable
 */

/* ========================
   🔹 INTERNAL CACHE (OPTIONAL REUSE)
======================== */
const _p = { x: 0, y: 0 };

/* ========================
   ১. DISTANCE
======================== */
export const distanceSquared = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return dx * dx + dy * dy;
};

export const getDistance = (a, b) =>
  Math.sqrt(distanceSquared(a, b));

/* ========================
   ২. VELOCITY (STABLE)
======================== */
export const getVelocity = (prev, curr, dt) => {
  if (!prev || dt <= 0) return 0;

  const safeDt = Math.min(Math.max(dt, 8), 32);
  const dist = getDistance(prev, curr);

  return Math.min(dist / safeDt, 1.2); // 🔥 tighter clamp
};

/* ========================
   ৩. CORE PROCESS (SIMPLIFIED 🔥)
======================== */
export const processPoint = (
  prev,
  curr,
  dt,
  config = {},
  out
) => {
  if (!prev) return curr;

  const {
    alpha = 0.18,         // 🔥 FIXED smoothing (stable)
    predict = false,      // 🔥 OFF by default (important)
    predictFactor = 1.05, // safe prediction
  } = config;

  const target = out || { x: 0, y: 0 };

  let tx = curr.x;
  let ty = curr.y;

  // ✅ optional prediction (disabled by default)
  if (predict) {
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;

    tx = curr.x + dx * predictFactor;
    ty = curr.y + dy * predictFactor;
  }

  // ✅ stable EMA smoothing
  target.x = prev.x + (tx - prev.x) * alpha;
  target.y = prev.y + (ty - prev.y) * alpha;

  return target;
};

/* ========================
   ৪. INTERPOLATION (NO GAPS)
======================== */
export const interpolatePoints = (a, b, out = []) => {
  out.length = 0;

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const steps = Math.max(1, Math.floor(dist / 1.2));

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    out.push({
      x: a.x + dx * t,
      y: a.y + dy * t,
    });
  }

  return out;
};

/* ========================
   ৫. PRESSURE
======================== */
export const getBrushSize = (velocity, min = 2, max = 10) => {
  const v = Math.min(velocity * 0.04, 1); // smoother curve
  return max - (max - min) * v;
};

/* ========================
   ৬. MIDPOINT
======================== */
export const getMidPoint = (a, b) => ({
  x: (a.x + b.x) * 0.5,
  y: (a.y + b.y) * 0.5,
});

/* ========================
   ৭. LERP
======================== */
export const lerp = (a, b, t) => a + (b - a) * t;

/* ========================
   ৮. CANVAS MAP
======================== */
export const getCanvasCoords = (lm, rect) => {
  return {
    x: Math.min(Math.max(0, lm.x * rect.width), rect.width),
    y: Math.min(Math.max(0, lm.y * rect.height), rect.height),
  };
};

/* ========================
   ৯. VECTOR OPS
======================== */
export const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (p, s) => ({ x: p.x * s, y: p.y * s });

/* ========================
   🔟 SNAP GRID
======================== */
export const snapToGrid = (p, size) => ({
  x: Math.round(p.x / size) * size,
  y: Math.round(p.y / size) * size,
});

/* ========================
   ১১. LEGACY WRAPPERS (SAFE)
======================== */
export const smoothPoint = (prev, curr, alpha = 0.18) =>
  processPoint(prev, curr, 16, { alpha });

export const predictPoint = (prev, curr) =>
  processPoint(prev, curr, 16, { predict: true });

/* ========================
   ১২. BOUNDS
======================== */
export const calculateBounds = (imgWidth, imgHeight, options = {}) => {
  const ratio = imgHeight / imgWidth;

  let width = options.maxWidth || imgWidth;
  let height = width * ratio;

  if (options.maxHeight && height > options.maxHeight) {
    height = options.maxHeight;
    width = height / ratio;
  }

  return { width, height };
};

/* ========================
   ১৩. RANDOM POSITION (RESTORED ⚠️)
======================== */
export const generateRandomPos = (
  containerWidth,
  containerHeight,
  options = {}
) => {
  const margin = options.margin || 0;
  const snap = options.snapGrid || 0;

  let x = Math.random() * (containerWidth - 2 * margin) + margin;
  let y = Math.random() * (containerHeight - 2 * margin) + margin;

  if (snap > 0) {
    x = Math.round(x / snap) * snap;
    y = Math.round(y / snap) * snap;
  }

  return { x, y };
};