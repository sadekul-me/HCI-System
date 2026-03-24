/**
 * HCI System Gesture Engine v6 (ULTRA PRO FINAL)
 * High Accuracy + Stability + Smooth Tracking + Mirror FIXED
 */

/* ===============================
   🧠 INTERNAL STATE
================================ */

const HISTORY_SIZE = 5;

const pinchHistory = [];
const palmHistory = [];
const fistHistory = [];

let lastPoint = null; // 🔥 smoothing memory

const pushHistory = (arr, value) => {
  arr.push(value);
  if (arr.length > HISTORY_SIZE) arr.shift();
};

const majorityTrue = (arr) => {
  const count = arr.filter(Boolean).length;
  return count >= Math.ceil(arr.length * 0.6);
};

/* ===============================
   🔧 UTIL FUNCTIONS
================================ */

const distance = (a, b) =>
  Math.hypot(a.x - b.x, a.y - b.y);

const fingerBent = (tip, pip, mcp) => {
  const v1x = pip.x - tip.x;
  const v1y = pip.y - tip.y;

  const v2x = pip.x - mcp.x;
  const v2y = pip.y - mcp.y;

  const dot = v1x * v2x + v1y * v2y;

  const mag1 = Math.hypot(v1x, v1y);
  const mag2 = Math.hypot(v2x, v2y);

  const denom = mag1 * mag2;

  // ❗ NaN FIX
  if (denom === 0) return false;

  const angle = Math.acos(dot / denom);

  return angle < 1.6;
};

/* ===============================
   🤏 PINCH DETECTION (STABLE)
================================ */

export const detectPinch = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return false;

  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];

  const wrist = landmarks[0];
  const palm = landmarks[9];

  const handSize = distance(wrist, palm);
  if (!handSize) return false;

  const normalizedIndex = distance(thumb, index) / handSize;
  const normalizedMiddle = distance(thumb, middle) / handSize;

  const indexBentState = fingerBent(
    landmarks[8],
    landmarks[6],
    landmarks[5]
  );

  const score =
    (normalizedIndex < 0.20 ? 0.5 : 0) +
    (normalizedMiddle < 0.30 ? 0.2 : 0) +
    (indexBentState ? 0.3 : 0);

  const detected = score > 0.6;

  pushHistory(pinchHistory, detected);
  return majorityTrue(pinchHistory);
};

/* ===============================
   🖐️ PALM OPEN DETECTION
================================ */

export const isPalmOpen = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return false;

  const fingers = [
    [8, 6],
    [12, 10],
    [16, 14],
    [20, 18]
  ];

  let extended = 0;

  for (const [tip, pip] of fingers) {
    if (landmarks[tip].y < landmarks[pip].y) {
      extended++;
    }
  }

  const detected = extended >= 4;

  pushHistory(palmHistory, detected);
  return majorityTrue(palmHistory);
};

/* ===============================
   ✊ FIST DETECTION
================================ */

export const detectFist = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return false;

  const wrist = landmarks[0];
  const base = landmarks[5];

  const palmSize = distance(wrist, base);
  if (!palmSize) return false;

  const fingerTips = [8, 12, 16, 20];

  const detected = fingerTips.every((id) => {
    const tip = landmarks[id];
    const normalized = distance(tip, wrist) / palmSize;
    return normalized < 1.2;
  });

  pushHistory(fistHistory, detected);
  return majorityTrue(fistHistory);
};

/* ===============================
   🎯 CANVAS MAPPING (ULTRA SMOOTH + NO MIRROR)
================================ */

export const mapLandmarksToCanvas = (landmark, width, height) => {
  if (!landmark) return { x: 0, y: 0 };

  const dpr = window.devicePixelRatio || 1;

  // ❗ NO MIRROR HERE (IMPORTANT)
  const raw = {
    x: landmark.x * width * dpr,
    y: landmark.y * height * dpr
  };

  // 🧠 LERP SMOOTHING
  if (!lastPoint) {
    lastPoint = raw;
    return raw;
  }

  const smooth = {
    x: lastPoint.x + (raw.x - lastPoint.x) * 0.35,
    y: lastPoint.y + (raw.y - lastPoint.y) * 0.35
  };

  lastPoint = smooth;
  return smooth;
};

/* ===============================
   🔄 RESET (IMPORTANT FOR MODE SWITCH)
================================ */

export const resetTracking = () => {
  lastPoint = null;
  pinchHistory.length = 0;
  palmHistory.length = 0;
  fistHistory.length = 0;
};