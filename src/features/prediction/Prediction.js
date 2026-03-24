/**
 * ULTRA-PRO Gesture Prediction
 * - Multi-gesture, confidence smoothing, actionable outputs
 */
const history = [];
const HISTORY_SIZE = 5; // last 5 frames for smoothing

export const predictGestureUltra = (landmarks) => {
  if (!landmarks || landmarks.length < 21) return { mode: "idle", gesture: "none", confidence: 0 };

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const wrist = landmarks[0];

  // === Distance Metrics ===
  const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
  const indexMiddleDist = Math.hypot(indexTip.x - middleTip.x, indexTip.y - middleTip.y);

  // === Gesture Detection ===
  let gesture = "scanning";
  let mode = "idle";
  let confidence = 0;

  // 1️⃣ Move / Drag Mode (Pinch)
  if (pinchDist < 0.05) {
    gesture = "pinch";
    mode = "move";
    confidence = 0.9;
  }
  // 2️⃣ Draw Mode (Index Up)
  else if (indexTip.y < landmarks[6].y && middleTip.y > landmarks[10].y && ringTip.y > landmarks[14].y) {
    gesture = "index-up";
    mode = "draw";
    confidence = 0.85;
  }
  // 3️⃣ Navigate (Open Palm)
  else if (indexTip.y < landmarks[6].y && middleTip.y < landmarks[10].y && pinkyTip.y < landmarks[18].y) {
    gesture = "open-palm";
    mode = "navigate";
    confidence = 0.8;
  }
  // 4️⃣ Fist (Special Action)
  else if (pinchDist > 0.15 && indexTip.y > landmarks[6].y && middleTip.y > landmarks[10].y) {
    gesture = "fist";
    mode = "special";
    confidence = 0.75;
  }

  // === Smoothing with History ===
  history.push({ mode, gesture, confidence });
  if (history.length > HISTORY_SIZE) history.shift();

  // Count most frequent mode in history
  const modeCount = {};
  history.forEach(h => {
    modeCount[h.mode] = (modeCount[h.mode] || 0) + 1;
  });
  const smoothedMode = Object.keys(modeCount).reduce((a, b) => (modeCount[a] > modeCount[b] ? a : b));

  // Return latest + smoothed output
  return { mode: smoothedMode, gesture, confidence };
};