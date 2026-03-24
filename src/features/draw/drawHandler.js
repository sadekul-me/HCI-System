/* ==========================================================
   🎨 DRAW HANDLER v6 (LÌ ÀO PRECISION ENGINE)
   Super Smooth + Zero Lag + Predictive Stability
   ========================================================== */

let lastPoint = null;
let lastTime = 0;
let lastSize = 6;
let velocity = { x: 0, y: 0 };

/* ===============================
   ⚙️ TUNING CONSTANTS
=============================== */
const MIN_DISTANCE = 0.8;      // Micro-jitter filter
const SMOOTHING = 0.22;        // Low-pass filter weight
const VELOCITY_DECAY = 0.15;   // Momentum prediction

export const drawHandler = {

  process: (
    landmarks,
    mode,
    points,
    { color, brushSize, isOverlayOpen },
    canvasWidth,
    canvasHeight
  ) => {

    /* ===============================
       🚫 BLOCK CONDITIONS
    =============================== */
    if (isOverlayOpen || mode !== "draw") return null;
    if (!landmarks || landmarks.length < 21) return null;

    /* ===============================
       ✋ FINGER DETECTION (STABLE)
    =============================== */
    const tip = landmarks[8];
    const pip = landmarks[6];
    const mcp = landmarks[5];

    // Precision check: distance between tip and pip for state stability
    const isDrawing = tip.y < pip.y - 0.02; 

    if (!isDrawing) {
      drawHandler.reset();
      return drawHandler.createGap();
    }

    /* ===============================
       📐 COORDINATE MAPPING
    =============================== */
    const rawX = tip.x * canvasWidth;
    const rawY = tip.y * canvasHeight;
    const now = performance.now();

    /* ===============================
       🧠 FIRST POINT INITIALIZATION
    =============================== */
    if (!lastPoint) {
      lastPoint = { x: rawX, y: rawY };
      lastTime = now;
      lastSize = brushSize || 6;

      return {
        x: rawX,
        y: rawY,
        color: color || "#F5D061",
        size: lastSize,
        isDrawing: true,
        timestamp: now
      };
    }

    /* ===============================
       ⚡ SIGNAL PROCESSING (SMOOTHING)
    =============================== */
    const dt = Math.max(1, now - lastTime);
    const dx = rawX - lastPoint.x;
    const dy = rawY - lastPoint.y;
    const dist = Math.hypot(dx, dy);

    // Skip micro-shaking
    if (dist < MIN_DISTANCE) return null;

    // ⚡ DYNAMIC LERP + VELOCITY PREDICTION
    // Eta hand skeleton-er sathe drawing-er lag zero kore dibe
    const targetX = rawX + (dx * VELOCITY_DECAY);
    const targetY = rawY + (dy * VELOCITY_DECAY);

    const smoothX = lastPoint.x + (targetX - lastPoint.x) * SMOOTHING;
    const smoothY = lastPoint.y + (targetY - lastPoint.y) * SMOOTHING;

    /* ===============================
       🎯 ADAPTIVE THICKNESS
    =============================== */
    const speed = dist / dt;
    const sizeTarget = brushSize || (Math.max(3, 10 - speed * 1.5));
    
    // Smooth thickness transition
    const finalSize = lastSize + (sizeTarget - lastSize) * 0.2;

    /* ===============================
       ✅ FINAL PRECISION POINT
    =============================== */
    const finalPoint = {
      x: smoothX,
      y: smoothY,
      color: color || "#F5D061",
      size: finalSize,
      isDrawing: true,
      timestamp: now
    };

    // Update trackers for next frame
    lastPoint = { x: smoothX, y: smoothY };
    lastTime = now;
    lastSize = finalSize;

    return finalPoint;
  },

  /* ===============================
      ✂️ GAP
  =============================== */
  createGap: () => ({
    x: null,
    y: null,
    isDrawing: false
  }),

  /* ===============================
      🧹 RESET ENGINE
  =============================== */
  reset: () => {
    lastPoint = null;
    lastTime = 0;
    lastSize = 6;
    velocity = { x: 0, y: 0 };
  }
};